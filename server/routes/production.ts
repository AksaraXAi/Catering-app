import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/production/summary - Daily production box count & ingredient calculation
router.get('/production/summary', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const summary = db.getProductionDailySummary(tenantId, targetDate);
  return res.json({ success: true, ...summary });
});

// POST /api/production/status - Update production status (Belum Diproduksi / Diproses / Selesai)
router.post('/production/status', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { date, status, notes } = req.body;
  if (!date || !status) {
    return res.status(400).json({ success: false, error: 'Tanggal dan status produksi wajib diisi.' });
  }

  const updated = db.updateProductionStatus(tenantId, date, status, notes);
  return res.json({ success: true, production: updated });
});

export default router;
