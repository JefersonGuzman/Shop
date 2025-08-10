import compression from 'compression';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';

import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';
import productsRouter from './routes/products';
import offersRouter from './routes/offers';
import categoriesRouter from './routes/categories';
import brandsRouter from './routes/brands';

export function createApp(): Application {
  const app = express();

  // Middlewares base
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

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

  return app;
}

export default createApp;


