import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/public/tenants/:slug/menus - Public catalog for customer ordering
router.get('/public/tenants/:slug/menus', (req, res) => {
  const { slug } = req.params;
  const tenant = db.getTenantBySlug(slug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Catering tidak ditemukan.' });
  }

  const menus = db.getMenus(tenant.id, true); // Active only
  return res.json({ success: true, menus });
});

// GET /api/menus - Admin get menus for active tenant
router.get('/menus', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const menus = db.getMenus(tenantId, false); // All including inactive
  return res.json({ success: true, menus });
});

// POST /api/menus - Admin create menu
router.post('/menus', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { name, description, price, category, imageUrl, active } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, error: 'Nama menu dan harga per porsi wajib diisi.' });
  }

  const menu = db.createMenu(tenantId, {
    name,
    description: description || '',
    price: Number(price) || 0,
    category: category || 'Nasi Box',
    imageUrl: imageUrl || null,
    active: active !== undefined ? Boolean(active) : true,
  });

  return res.status(201).json({ success: true, menu });
});

// PUT /api/menus/:id - Admin update menu
router.put('/menus/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const updated = db.updateMenu(tenantId, id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Menu tidak ditemukan.' });
  }

  return res.json({ success: true, menu: updated });
});

// DELETE /api/menus/:id - Admin delete menu
router.delete('/menus/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const deleted = db.deleteMenu(tenantId, id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Menu tidak ditemukan.' });
  }

  return res.json({ success: true, message: 'Menu berhasil dihapus.' });
});

export default router;
