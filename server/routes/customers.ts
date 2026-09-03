import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/customers - List customers with order count & total spend
router.get('/customers', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const customers = db.getCustomers(tenantId);
  const orders = db.getOrders(tenantId);

  const enriched = customers.map((c) => {
    const custOrders = orders.filter((o) => o.customerId === c.id || o.customerWhatsapp === c.whatsapp);
    const totalSpent = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      ...c,
      totalOrders: custOrders.length,
      totalSpent,
      orders: custOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        eventDate: o.eventDate,
        totalAmount: o.totalAmount,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
      })),
    };
  });

  return res.json({ success: true, customers: enriched });
});

export default router;
