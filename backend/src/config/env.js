/** Central, validated runtime configuration. Reads process.env (loaded by `node --env-file`). */
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
const list = (v, d = []) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(v ? [] : d);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digrow',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  corsOrigins: list(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://localhost:4173', 'http://localhost']),
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  uploadsBaseUrl: (process.env.UPLOADS_BASE_URL || '/api/uploads').replace(/\/+$/, ''),
  admin: {
    name: process.env.ADMIN_NAME || 'Admin User',
    email: process.env.ADMIN_EMAIL || 'admin@digrow.rw',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Di-Grow <no-reply@digrow.rw>',
  },
};

export function assertEnv() {
  if (!env.jwtSecret || env.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET must be set to at least 16 characters (see backend/.env.example)');
  }
  if (env.isProd && /change-me|dev-only/i.test(env.jwtSecret)) {
    throw new Error('JWT_SECRET still has the development placeholder value');
  }
}

export default env;
