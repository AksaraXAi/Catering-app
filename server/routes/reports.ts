import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/reports - Financial & operational analytics
router.get('/reports', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const reports = db.getReports(tenantId);
  return res.json({ success: true, reports });
});

// GET /api/reports/export-csv - Download real CSV file
router.get('/reports/export-csv', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const tenant = db.getTenantById(tenantId);
  const orders = db.getOrders(tenantId);

  const headers = [
    'Nomor Order',
    'Tanggal Acara',
    'Jam Kirim',
    'Nama Pelanggan',
    'WhatsApp',
    'Alamat Pengiriman',
    'Total Tagihan (Rp)',
    'DP (Rp)',
    'Sisa Tagihan (Rp)',
    'Status Pesanan',
    'Status Pembayaran',
    'Menu & Porsi',
    'Catatan',
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((it) => `${it.menuName} (${it.quantity}x)`)
      .join('; ');

    return [
      `"${o.orderNumber}"`,
      `"${o.eventDate}"`,
      `"${o.deliveryTime}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"'${o.customerWhatsapp}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      o.totalAmount,
      o.dpAmount,
      o.remainingAmount,
      `"${o.orderStatus}"`,
      `"${o.paymentStatus}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const filename = `Laporan_Catering_${tenant ? tenant.slug : 'Tenant'}_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(csvContent);
});

export default router;
