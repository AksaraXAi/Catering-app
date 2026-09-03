import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/delivery - List deliveries for date
router.get('/delivery', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { date } = req.query;
  const deliveries = db.getDeliveries(tenantId, date as string);

  // Enrich with Google Maps URL and WhatsApp direct chat
  const enriched = deliveries.map(({ order, delivery }) => {
    const encodedAddress = encodeURIComponent(order.deliveryAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const cleanWA = order.customerWhatsapp.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Halo Bpk/Ibu ${order.customerName}, kami dari catering ingin mengabarkan mengenai pengiriman pesanan No. ${order.orderNumber}.`);
    const whatsappUrl = `https://wa.me/${cleanWA}?text=${waText}`;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime,
      eventDate: order.eventDate,
      totalAmount: order.totalAmount,
      remainingAmount: order.remainingAmount,
      paymentStatus: order.paymentStatus,
      items: order.items,
      notes: order.notes,
      deliveryId: delivery.id,
      driverName: delivery.driverName,
      driverPhone: delivery.driverPhone,
      deliveryStatus: delivery.status,
      deliveryNotes: delivery.notes,
      googleMapsUrl,
      whatsappUrl,
    };
  });

  return res.json({ success: true, deliveries: enriched });
});

// PUT /api/delivery/:orderId - Update delivery details & status
router.put('/delivery/:orderId', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { orderId } = req.params;
  const updated = db.updateDelivery(tenantId, orderId, req.body);
  return res.json({ success: true, delivery: updated });
});

export default router;
