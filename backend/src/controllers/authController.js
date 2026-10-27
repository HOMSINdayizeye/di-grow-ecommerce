import { env } from '../config/env.js';
import { User, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { randomToken, sha256 } from '../lib/utils.js';
import { sendMail } from '../lib/mailer.js';

const sessionUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

export const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user, { remember });
  AuditLog.record(user, 'auth.login', user.email, remember ? 'remembered session' : '');
  res.json({ success: true, data: { token, user: sessionUser(user) } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: sessionUser(req.user) });
});

/** Tokens are stateless; the client drops it. Kept so the frontend call succeeds. */
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { message: 'Signed out' } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+resetTokenHash +resetTokenExpires');
  // Always answer the same way so the form cannot be used to discover accounts.
  const reply = { success: true, data: { message: 'If that email exists, a reset link has been sent.' } };
  if (!user) return res.json(reply);

  const token = randomToken(32);
  user.resetTokenHash = sha256(token);
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const link = `${env.frontendUrl}/admin/reset-password/${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your Di-Grow admin password',
    text: `Hello ${user.name},\n\nUse this link within one hour to choose a new password:\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    html: `<p>Hello ${user.name},</p><p>Use this link within one hour to choose a new password:</p><p><a href="${link}">${link}</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
  });
  return res.json(reply);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ resetTokenHash: sha256(token), resetTokenExpires: { $gt: new Date() } }).select(
    '+resetTokenHash +resetTokenExpires +passwordHash'
  );
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired. Request a new one.');
  await user.setPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  AuditLog.record(user, 'auth.password_reset', user.email);
  res.json({ success: true, data: { message: 'Password updated. You can now sign in.' } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.verifyPassword(currentPassword))) throw ApiError.badRequest('Current password is incorrect');
  if (currentPassword === newPassword) throw ApiError.badRequest('Choose a password you have not used before');
  await user.setPassword(newPassword, { keepSessions: true });
  await user.save();
  AuditLog.record(user, 'auth.password_change', user.email);
  res.json({ success: true, data: { message: 'Password changed.' } });
});
