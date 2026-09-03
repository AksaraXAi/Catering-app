import express from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest, getActiveTenantId } from '../auth.ts';

const router = express.Router();

// GET /api/ingredients - List ingredients
router.get('/ingredients', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const ingredients = db.getIngredients(tenantId);
  return res.json({ success: true, ingredients });
});

// POST /api/ingredients - Add ingredient
router.post('/ingredients', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { name, unit, stock, minimumStock, costPerUnit } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ success: false, error: 'Nama bahan dan satuan wajib diisi.' });
  }

  const ingredient = db.createIngredient(tenantId, {
    name,
    unit,
    stock: parseFloat(stock) || 0,
    minimumStock: parseFloat(minimumStock) || 0,
    costPerUnit: parseFloat(costPerUnit) || 0,
  });

  return res.status(201).json({ success: true, ingredient });
});

// PUT /api/ingredients/:id - Update ingredient
router.put('/ingredients/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const updated = db.updateIngredient(tenantId, id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Bahan tidak ditemukan.' });
  }

  return res.json({ success: true, ingredient: updated });
});

// DELETE /api/ingredients/:id - Delete ingredient
router.delete('/ingredients/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { id } = req.params;
  const deleted = db.deleteIngredient(tenantId, id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Bahan tidak ditemukan.' });
  }

  return res.json({ success: true, message: 'Bahan berhasil dihapus.' });
});

// GET /api/recipes - Get recipes for menu
router.get('/recipes', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { menuId } = req.query;
  const recipes = db.getRecipes(tenantId, menuId as string);
  const ingredients = db.getIngredients(tenantId);
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  const enriched = recipes.map((r) => ({
    ...r,
    ingredient: ingredientMap.get(r.ingredientId) || null,
  }));

  return res.json({ success: true, recipes: enriched });
});

// POST /api/recipes - Save recipe for menu
router.post('/recipes', requireAuth, (req: AuthenticatedRequest, res) => {
  const tenantId = getActiveTenantId(req);
  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant ID tidak ditemukan.' });
  }

  const { menuId, items } = req.body;
  if (!menuId || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Menu ID dan daftar bahan resep diperlukan.' });
  }

  const saved = db.saveRecipesForMenu(tenantId, menuId, items);
  return res.json({ success: true, recipes: saved });
});

export default router;
