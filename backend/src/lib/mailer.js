import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transport = null;
if (env.smtp.host) {
  transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
}

/**
 * Send an email if SMTP is configured; otherwise print it so development still works.
 * Never throws: email is a side effect and must not fail the request.
 */
export async function sendMail({ to, subject, text, html }) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) return false;
  if (!transport) {
    logger.info(`[mail:console] To: ${recipients.join(', ')} | ${subject}\n${text || ''}`);
    return false;
  }
  try {
    await transport.sendMail({ from: env.smtp.from, to: recipients.join(', '), subject, text, html });
    return true;
  } catch (err) {
    logger.error('Email failed', err.message);
    return false;
  }
}
export default sendMail;
