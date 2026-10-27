import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { UPLOADS_DIR } from './config/paths.js';
import publicRoutes from './routes/public/index.js';
import adminRoutes from './routes/admin/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin requests (nginx / Vite proxy) have no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} is not allowed`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  if (!env.isProd) app.use(morgan('dev'));

  const api = express.Router();
  api.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), env: env.nodeEnv } }));
  api.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d', immutable: true, index: false }));
  api.use(apiLimiter);
  api.use('/admin', adminRoutes);
  api.use('/', publicRoutes);

  app.use('/api', api);
  app.get('/', (_req, res) => res.json({ success: true, data: { name: 'Di-Grow API', docs: '/api/health' } }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export default createApp;
