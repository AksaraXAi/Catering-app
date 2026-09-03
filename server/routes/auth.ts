import express from 'express';
import { db } from '../db.ts';
import { generateToken, hashPassword, comparePassword, requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const tenant = user.tenantId ? db.getTenantById(user.tenantId) : null;
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: tenant || null,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
  }

  const tenant = user.tenantId ? db.getTenantById(user.tenantId) : null;
  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: tenant || null,
    },
  });
});

export default router;
