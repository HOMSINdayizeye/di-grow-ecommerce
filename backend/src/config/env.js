/** Central, validated runtime configuration. Reads process.env (loaded by `node --env-file`). */
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
const list = (v, d = []) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(v ? [] : d);

/**
 * Email can be configured two ways:
 *  - Brevo: set BREVO_API_KEY plus BREVO_EMAIL_SENDER. An "xkeysib-" API key sends through the
 *    Brevo REST API; an "xsmtpsib-" SMTP key sends through smtp-relay.brevo.com (set SMTP_USER
 *    to the Brevo SMTP login when it differs from the sender address).
 *  - Any SMTP server: SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM.
 * With neither, emails are printed to the console.
 */
function mailConfig() {
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  const brevoSender = (process.env.BREVO_EMAIL_SENDER || '').trim();
  const brevoSenderName = (process.env.BREVO_EMAIL_SENDER_NAME || 'Di-Grow').trim();
  const brevoIsApiKey = /^xkeysib-/i.test(brevoKey);
  const brevoIsSmtpKey = /^xsmtpsib-/i.test(brevoKey);

  const smtpHost =
    (process.env.SMTP_HOST || '').trim() || (brevoKey && !brevoIsApiKey ? 'smtp-relay.brevo.com' : '');
  const smtpUser =
    (process.env.SMTP_USER || '').trim() ||
    (process.env.BREVO_SMTP_LOGIN || '').trim() ||
    (smtpHost.endsWith('brevo.com') ? brevoSender : '');
  const smtpPass = process.env.SMTP_PASS || (brevoIsSmtpKey ? brevoKey : '');

  const from = brevoSender
    ? `${brevoSenderName} <${brevoSender}>`
    : process.env.SMTP_FROM || 'Di-Grow <no-reply@digrow.rw>';

  let provider = 'console';
  if (brevoIsApiKey) provider = 'brevo-api';
  else if (smtpHost) provider = 'smtp';

  return {
    provider,
    from,
    sender: { email: brevoSender, name: brevoSenderName },
    brevoApiKey: brevoIsApiKey ? brevoKey : '',
    smtp: { host: smtpHost, port: num(process.env.SMTP_PORT, 587), user: smtpUser, pass: smtpPass },
  };
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digrow',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  corsOrigins: list(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://localhost:4173', 'http://localhost']),
  // One URL only (used in emails); if several were pasted ("a, b" or "a || b") keep the first.
  frontendUrl: (String(process.env.FRONTEND_URL || '').split(/[\s,|]+/).filter(Boolean)[0] || 'http://localhost:5173').replace(/\/+$/, ''),
  // Absolute on Render (RENDER_EXTERNAL_URL is set by Render), so image URLs work from a frontend on another domain.
  uploadsBaseUrl: (process.env.UPLOADS_BASE_URL || (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/api/uploads` : '/api/uploads')).replace(/\/+$/, ''),
  admin: {
    name: process.env.ADMIN_NAME || 'Admin User',
    email: process.env.ADMIN_EMAIL || 'admin@digrow.rw',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  mail: mailConfig(),
};

/** Kept for code that still reads env.smtp.* */
env.smtp = { ...env.mail.smtp, from: env.mail.from };

export function assertEnv() {
  if (!env.jwtSecret || env.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET must be set to at least 16 characters (see backend/.env.example)');
  }
  if (env.isProd && /change-me|dev-only/i.test(env.jwtSecret)) {
    throw new Error('JWT_SECRET still has the development placeholder value');
  }
}

export default env;
