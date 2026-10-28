import { Settings, AuditLog } from '../models/index.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/ApiError.js';
import { verifyMailer, sendMailOrThrow, describeMailer, mailHint } from '../lib/mailer.js';

export const getPublic = asyncHandler(async (_req, res) => {
  const s = await Settings.get();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, data: s.toPublic() });
});

export const get = asyncHandler(async (_req, res) => {
  const s = await Settings.get();
  res.json({ success: true, data: s });
});

export const update = asyncHandler(async (req, res) => {
  const s = await Settings.get();
  const changed = Object.keys(req.body).filter((k) => String(s[k]) !== String(req.body[k]));
  Object.assign(s, req.body);
  await s.save();
  AuditLog.record(req.user, 'settings.update', 'Site settings', changed.length ? `${changed.join(', ')} updated` : 'no changes');
  res.json({ success: true, data: s });
});

/** Which email provider is active and whether it accepts our login. */
export const mailStatus = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await verifyMailer() });
});

/** Send a test email to the signed-in admin so a broken setup shows up before someone needs a reset link. */
export const testEmail = asyncHandler(async (req, res) => {
  const to = req.user.email;
  try {
    await sendMailOrThrow({
      to,
      subject: 'Di-Grow test email',
      text: `Hello ${req.user.name},\n\nEmail from the Di-Grow admin is working. Password reset links and order alerts will arrive like this.\n\nProvider: ${describeMailer()}`,
      html: `<p>Hello ${req.user.name},</p><p>Email from the Di-Grow admin is working. Password reset links and order alerts will arrive like this.</p><p style="color:#64748b;font-size:12px">Provider: ${describeMailer()}</p>`,
    });
  } catch (err) {
    throw ApiError.badRequest(`Email failed: ${err.message}. ${mailHint(err.message)}`.trim());
  }
  AuditLog.record(req.user, 'settings.test_email', to);
  res.json({ success: true, data: { message: `Test email sent to ${to}. Check the inbox (and the spam folder).`, provider: describeMailer() } });
});
