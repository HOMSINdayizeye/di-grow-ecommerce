import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const { mail } = env;

let transport = null;
if (mail.provider === 'smtp') {
  transport = nodemailer.createTransport({
    host: mail.smtp.host,
    port: mail.smtp.port,
    secure: mail.smtp.port === 465,
    auth: mail.smtp.user ? { user: mail.smtp.user, pass: mail.smtp.pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

/** Split "Name <email>" into the parts the Brevo API wants. */
function parseAddress(value) {
  const m = String(value || '').match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim() };
  return { email: String(value || '').trim() };
}

async function sendViaBrevoApi({ recipients, subject, text, html }) {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: { 'api-key': mail.brevoApiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: mail.sender.email ? { email: mail.sender.email, name: mail.sender.name } : parseAddress(mail.from),
      to: recipients.map((email) => ({ email })),
      subject,
      textContent: text || undefined,
      htmlContent: html || undefined,
    }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`Brevo API ${res.status}: ${detail}`);
  }
}

async function deliver({ recipients, subject, text, html }) {
  if (mail.provider === 'brevo-api') {
    await sendViaBrevoApi({ recipients, subject, text, html });
  } else {
    await transport.sendMail({ from: mail.from, to: recipients.join(', '), subject, text, html });
  }
}

const toList = (to) => (Array.isArray(to) ? to : [to]).map((s) => String(s || '').trim()).filter(Boolean);

/** Human readable description of the active mail setup, for the startup log and the settings page. */
export function describeMailer() {
  if (mail.provider === 'brevo-api') return `Brevo API, sender ${mail.sender.email || mail.from}`;
  if (mail.provider === 'smtp') {
    return `SMTP ${mail.smtp.host}:${mail.smtp.port}, login ${mail.smtp.user || 'none'}, sender ${mail.from}`;
  }
  return 'console only (no BREVO_API_KEY or SMTP_HOST set)';
}

/** Turn common provider errors into something an admin can act on. */
export function mailHint(message = '') {
  const m = String(message).toLowerCase();
  if (m.includes('535') || m.includes('authentication') || m.includes('invalid login') || m.includes('key not found') || m.includes('401')) {
    return 'Check the credentials: in Brevo open SMTP & API > SMTP, copy the "Login" value into SMTP_USER and the SMTP key into BREVO_API_KEY (or SMTP_PASS), then restart the API.';
  }
  if (m.includes('sender') || m.includes('not verified') || m.includes('unauthorized')) {
    return 'The sender address must be verified in Brevo (Senders, Domains & Dedicated IPs > Senders) and match BREVO_EMAIL_SENDER.';
  }
  if (m.includes('econnrefused') || m.includes('etimedout') || m.includes('enotfound') || m.includes('timeout') || m.includes('econnreset')) {
    return 'The server could not reach the mail host. Check SMTP_HOST/SMTP_PORT and that outgoing port 587 is open.';
  }
  return '';
}

/**
 * Check the mail configuration without sending anything. Resolves to { ok, provider, detail, error? }.
 * For SMTP this opens a connection and authenticates, so a wrong login shows up here.
 */
export async function verifyMailer() {
  const result = { ok: false, provider: mail.provider, detail: describeMailer() };
  try {
    if (mail.provider === 'smtp') {
      await transport.verify();
    } else if (mail.provider === 'brevo-api') {
      const res = await fetch('https://api.brevo.com/v3/account', { headers: { 'api-key': mail.brevoApiKey, accept: 'application/json' } });
      if (!res.ok) throw new Error(`Brevo API answered ${res.status}`);
    }
    result.ok = true;
  } catch (err) {
    result.error = err.message;
    result.hint = mailHint(err.message);
  }
  return result;
}

/** Log the mail status once at startup so a broken login is visible immediately. */
export async function logMailerStatus() {
  const r = await verifyMailer();
  if (r.provider === 'console') {
    logger.warn(`Mail: ${r.detail}. Password reset links will be printed here instead of emailed.`);
  } else if (r.ok) {
    logger.info(`Mail: ready via ${r.detail}`);
  } else {
    logger.error(`Mail: NOT working via ${r.detail}. ${r.error}. ${r.hint}`);
  }
  return r;
}

/**
 * Send an email through the configured provider; print it when none is configured.
 * Never throws: email is a side effect and must not fail the request. Resolves to true when sent.
 */
export async function sendMail({ to, subject, text, html }) {
  const recipients = toList(to);
  if (!recipients.length) return false;
  if (mail.provider === 'console') {
    logger.info(`[mail:console] To: ${recipients.join(', ')} | ${subject}\n${text || ''}`);
    return false;
  }
  try {
    await deliver({ recipients, subject, text, html });
    logger.info(`[mail] Sent "${subject}" to ${recipients.join(', ')}`);
    return true;
  } catch (err) {
    logger.error(`Email failed (${describeMailer()}): ${err.message}. ${mailHint(err.message)}`);
    return false;
  }
}

/** Like sendMail but throws, so the admin "send test email" button can show the real error. */
export async function sendMailOrThrow({ to, subject, text, html }) {
  const recipients = toList(to);
  if (!recipients.length) throw new Error('No recipient');
  if (mail.provider === 'console') {
    throw new Error('No email provider is configured. Set BREVO_API_KEY (and BREVO_EMAIL_SENDER) or SMTP_HOST in backend/.env and restart the API.');
  }
  await deliver({ recipients, subject, text, html });
  logger.info(`[mail] Sent "${subject}" to ${recipients.join(', ')}`);
  return true;
}

export default sendMail;
