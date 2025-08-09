import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

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

  return app;
}

export default createApp;


