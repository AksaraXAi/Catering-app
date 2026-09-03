import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/payments - List payments
router.get('/payments', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const payments = db.getPayments(tenantId);
  const orders = db.getOrders(tenantId);
  const orderMap = new Map(orders.map((o) => [o.id, o]));

  const enriched = payments.map((p) => {
    const order = orderMap.get(p.orderId);
    return {
      ...p,
      orderNumber: order ? order.orderNumber : 'N/A',
      customerName: order ? order.customerName : 'N/A',
      totalAmount: order ? order.totalAmount : 0,
      remainingAmount: order ? order.remainingAmount : 0,
    };
  });

  return res.json({ success: true, payments: enriched });
});

// POST /api/payments - Record new payment
router.post('/payments', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { orderId, amount, paymentType, paymentMethod, paymentProofUrl, notes } = req.body;
  if (!orderId || !amount) {
    return res.status(400).json({ success: false, error: 'Order ID dan jumlah nominal pembayaran wajib diisi.' });
  }

  const result = db.createPayment(tenantId, {
    orderId,
    amount: parseFloat(amount),
    paymentType: paymentType || 'DP',
    paymentMethod: paymentMethod || 'Transfer Bank',
    paymentProofUrl: paymentProofUrl || null,
    notes: notes || '',
  });

  if (!result) {
    return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
  }

  return res.status(201).json({ success: true, payment: result.payment, order: result.order });
});

export default router;
