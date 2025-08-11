import compression from 'compression';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';

import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';
import productsRouter from './routes/products';
import offersRouter from './routes/offers';
import categoriesRouter from './routes/categories';
import brandsRouter from './routes/brands';
import ordersRouter from './routes/orders';

export function createApp(): Application {
  const app = express();

  // Middlewares base
  app.use(
    helmet({
      // Permitir carga/consumo cross-origin de recursos como beacons desde el frontend (5173)
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Evitar bloqueos de ventanas/herramientas en dev
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );
  // CORS con credenciales para frontend local
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin);
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type']
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  // Debug: simple request logger (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const bodyPreview = hasBody ? JSON.stringify(req.body).slice(0, 300) : '';
      console.log(`➡️  [REQ] ${req.method} ${req.originalUrl}`);
      if (bodyPreview) console.log(`   [BODY] ${bodyPreview}${bodyPreview.length === 300 ? '…' : ''}`);
      next();
    });
  }
  // Archivos estáticos subidos (siempre desde backend/uploads)
  app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

  // Health check minimal
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'Makers Tech API', timestamp: new Date().toISOString() });
  });

  // Rutas API
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/brands', brandsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/offers', offersRouter);
  app.use('/api/orders', ordersRouter);

  // 404 handler with logging
  app.use((req, res) => {
    console.warn(`🛑 [404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler with logging
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('🔥 [ERROR]', err?.message || err);
    if (err?.stack) console.error(err.stack);
    res.status(err?.status || 500).json({ error: err?.message || 'Internal Server Error' });
  });

  return app;
}

export default createApp;


