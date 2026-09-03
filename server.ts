import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

import authRoutes from './server/routes/auth.ts';
import tenantRoutes from './server/routes/tenants.ts';
import menuRoutes from './server/routes/menus.ts';
import orderRoutes from './server/routes/orders.ts';
import customerRoutes from './server/routes/customers.ts';
import paymentRoutes from './server/routes/payments.ts';
import productionRoutes from './server/routes/production.ts';
import ingredientRoutes from './server/routes/ingredients.ts';
import deliveryRoutes from './server/routes/delivery.ts';
import reportRoutes from './server/routes/reports.ts';
import uploadRoutes from './server/routes/upload.ts';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads directory for local images
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CateringApp API', timestamp: new Date().toISOString() });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', tenantRoutes);
  app.use('/api', menuRoutes);
  app.use('/api', orderRoutes);
  app.use('/api', customerRoutes);
  app.use('/api', paymentRoutes);
  app.use('/api', productionRoutes);
  app.use('/api', ingredientRoutes);
  app.use('/api', deliveryRoutes);
  app.use('/api', reportRoutes);
  app.use('/api', uploadRoutes);

  // Vite Middleware in Development vs Static in Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CateringApp Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
