import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/public/customer-lookup - Lookup customer for auto-fill
router.get('/public/customer-lookup', (req, res) => {
  const { slug, whatsapp } = req.query;
  if (!slug || !whatsapp) {
    return res.status(400).json({ success: false, error: 'Slug dan WhatsApp diperlukan.' });
  }

  const tenant = db.getTenantBySlug(slug as string);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Catering tidak ditemukan.' });
  }

  const customer = db.findCustomerByWhatsapp(tenant.id, whatsapp as string);
  if (!customer) {
    return res.json({ success: true, customer: null });
  }

  return res.json({
    success: true,
    customer: {
      name: customer.name,
      address: customer.address,
      notes: customer.notes,
    },
  });
});

// POST /api/public/orders - Customer places an order
router.post('/public/orders', (req, res) => {
  const {
    tenantSlug,
    eventDate,
    deliveryTime,
    deliveryAddress,
    customerName,
    customerWhatsapp,
    notes,
    items,
  } = req.body;

  if (!tenantSlug) {
    return res.status(400).json({ success: false, error: 'Tenant catering tidak valid.' });
  }

  const tenant = db.getTenantBySlug(tenantSlug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Usaha catering tidak ditemukan.' });
  }

  if (!customerName || !customerWhatsapp || !deliveryAddress || !eventDate || !deliveryTime) {
    return res.status(400).json({
      success: false,
      error: 'Nama, nomor WhatsApp, alamat pengiriman, tanggal acara, dan jam pengiriman wajib diisi.',
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Pilih minimal satu paket/menu makanan.' });
  }

  // Calculate total
  let totalAmount = 0;
  const processedItems = items.map((item: any) => {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const subtotal = qty * unitPrice;
    totalAmount += subtotal;
    return {
      menuId: item.menuId,
      menuName: item.menuName,
      quantity: qty,
      unitPrice,
      subtotal,
      notes: item.notes || '',
    };
  });

  const dpAmount = Math.round(totalAmount * 0.5); // Default DP 50%
  const remainingAmount = totalAmount;

  const newOrder = db.createOrder({
    tenantId: tenant.id,
    eventDate,
    deliveryTime,
    deliveryAddress,
    customerName,
    customerWhatsapp,
    notes,
    totalAmount,
    dpAmount,
    remainingAmount,
    items: processedItems,
  });

  // Generate WhatsApp chat link with pre-filled message
  const waTenant = tenant.whatsapp.replace(/[^0-9]/g, '');
  const itemsText = processedItems
    .map((it: any) => `- ${it.menuName} (${it.quantity} porsi x Rp ${it.unitPrice.toLocaleString('id-ID')})`)
    .join('%0A');

  const waMessage =
    `Halo *${encodeURIComponent(tenant.name)}*, saya ingin mengonfirmasi pesanan catering:%0A%0A` +
    `*No. Order:* ${newOrder.orderNumber}%0A` +
    `*Nama:* ${encodeURIComponent(customerName)}%0A` +
    `*Tanggal Acara:* ${newOrder.eventDate}%0A` +
    `*Jam Kirim:* ${newOrder.deliveryTime} WIB%0A` +
    `*Alamat:* ${encodeURIComponent(deliveryAddress)}%0A` +
    (notes ? `*Catatan:* ${encodeURIComponent(notes)}%0A` : '') +
    `%0A*Rincian Menu:*%0A${itemsText}%0A%0A` +
    `*Total Tagihan:* Rp ${totalAmount.toLocaleString('id-ID')}%0A` +
    `*Uang Muka (DP 50%):* Rp ${dpAmount.toLocaleString('id-ID')}%0A` +
    `*Sisa Pembayaran:* Rp ${remainingAmount.toLocaleString('id-ID')}%0A%0A` +
    `Mohon info rekening dan konfirmasi pesanan ini. Terima kasih!`;

  const whatsappUrl = `https://wa.me/${waTenant}?text=${waMessage}`;

  return res.status(201).json({
    success: true,
    order: newOrder,
    whatsappUrl,
    tenant: {
      name: tenant.name,
      whatsapp: tenant.whatsapp,
      bankInfo: tenant.bankInfo,
      address: tenant.address,
    },
  });
});

// GET /api/public/orders/:orderNumber - Customer confirmation & tracking page
router.get('/public/orders/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = db.getOrderByNumber(orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
  }

  return res.json({ success: true, order });
});

// GET /api/orders - Admin get orders list
router.get('/orders', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { status, date, search } = req.query;
  const orders = db.getOrders(tenantId, {
    status: status as string,
    date: date as string,
    search: search as string,
  });

  return res.json({ success: true, orders });
});

// GET /api/orders/:id - Admin get order detail
router.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const order = db.getOrderById(tenantId, id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
  }

  return res.json({ success: true, order });
});

// PUT /api/orders/:id - Admin update order
router.put('/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const updated = db.updateOrder(tenantId, id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
  }

  return res.json({ success: true, order: updated });
});

// DELETE /api/orders/:id - Admin delete/cancel order
router.delete('/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const deleted = db.deleteOrder(tenantId, id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
  }

  return res.json({ success: true, message: 'Pesanan berhasil dihapus.' });
});

export default router;
