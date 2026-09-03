import express from 'express';
import { db } from '../db.ts';
import { requireAuth, requireSuperAdmin, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/public/tenants/:slug - Public view of catering profile
router.get('/public/tenants/:slug', (req, res) => {
  const { slug } = req.params;
  const tenant = db.getTenantBySlug(slug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Usaha catering tidak ditemukan atau tidak aktif.' });
  }

  // Return public properties only
  return res.json({
    success: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo,
      description: tenant.description,
      whatsapp: tenant.whatsapp,
      address: tenant.address,
      bankInfo: tenant.bankInfo,
      colorTheme: tenant.colorTheme,
    },
  });
});

// GET /api/tenants - List all tenants (Super Admin or for tenant picker)
router.get('/tenants', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user?.role === 'SUPER_ADMIN') {
    return res.json({ success: true, tenants: db.getTenants() });
  }
  // If owner, return only their tenant
  const tenantId = req.user?.tenantId;
  const tenant = tenantId ? db.getTenantById(tenantId) : null;
  return res.json({ success: true, tenants: tenant ? [tenant] : [] });
});

// POST /api/tenants - Create new tenant (Super Admin)
router.post('/tenants', requireAuth, requireSuperAdmin, (req, res) => {
  const { name, slug, whatsapp, address, description, bankInfo, colorTheme, logo } = req.body;
  if (!name || !slug || !whatsapp) {
    return res.status(400).json({ success: false, error: 'Nama, slug URL, dan nomor WhatsApp wajib diisi.' });
  }

  // Check unique slug
  const existing = db.getTenantBySlug(slug);
  if (existing) {
    return res.status(400).json({ success: false, error: `Slug "${slug}" sudah digunakan oleh catering lain.` });
  }

  const cleanWA = whatsapp.replace(/[^0-9]/g, '');
  const newTenant = db.createTenant({
    name,
    slug: slug.toLowerCase().trim(),
    whatsapp: cleanWA,
    address: address || '',
    description: description || '',
    bankInfo: bankInfo || '',
    colorTheme: colorTheme || '#10B981',
    logo: logo || null,
  });

  return res.status(201).json({ success: true, tenant: newTenant });
});

// PUT /api/tenants/:id - Update tenant (Owner of tenant or Super Admin)
router.put('/tenants/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const activeTenantId = getActiveTenantId(req);

  if (req.user?.role !== 'SUPER_ADMIN' && activeTenantId !== id) {
    return res.status(403).json({ success: false, error: 'Akses ditolak: Anda tidak dapat mengubah data catering lain.' });
  }

  const updated = db.updateTenant(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Catering tidak ditemukan.' });
  }

  return res.json({ success: true, tenant: updated });
});

// DELETE /api/tenants/:id - Delete tenant (Super Admin)
router.delete('/tenants/:id', requireAuth, requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteTenant(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Catering tidak ditemukan.' });
  }
  return res.json({ success: true, message: 'Catering berhasil dihapus.' });
});

export default router;
