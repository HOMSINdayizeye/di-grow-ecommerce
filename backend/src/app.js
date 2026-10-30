import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { UPLOADS_DIR } from './config/paths.js';
import publicRoutes from './routes/public/index.js';
import adminRoutes from './routes/admin/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import * as media from './controllers/mediaController.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // CORS_ORIGINS entries may contain "*" (e.g. https://my-site*.vercel.app) to cover preview deployments.
  const originMatchers = env.corsOrigins.map((o) => {
    const clean = o.replace(/\/+$/, '').toLowerCase();
    if (!clean.includes('*')) return (origin) => origin.toLowerCase() === clean;
    const rx = new RegExp(`^${clean.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[a-z0-9-]*')}$`, 'i');
    return (origin) => rx.test(origin);
  });
  const originAllowed = (origin) => originMatchers.some((match) => match(origin));

  app.use(
    cors({
      origin(origin, cb) {
        // Requests without an Origin header (curl, server to server) are fine.
        if (!origin || originAllowed(origin)) return cb(null, true);
        // In development accept any localhost port, since Vite picks a free one (5173, 5174, ...).
        if (!env.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
        // Unknown origin: answer without CORS headers so the browser blocks it, instead of a 500.
        return cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  if (!env.isProd) app.use(morgan('dev'));

  const api = express.Router();
  api.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), env: env.nodeEnv } }));
  // Pictures stored in the database, then anything still on the disk.
  api.get('/uploads/m/:id/:name', media.serve);
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
