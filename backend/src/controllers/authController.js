import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { User, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { sha256 } from '../lib/utils.js';
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

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;

/** Email a 5-digit code the user types on the reset page, instead of a link. */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+resetTokenHash +resetTokenExpires +resetAttempts');
  // Always answer the same way so the form cannot be used to discover accounts.
  const reply = { success: true, data: { message: 'If that email exists, a 5-digit code has been sent to it.' } };
  if (!user) return res.json(reply);

  const code = String(crypto.randomInt(10000, 100000));
  user.resetTokenHash = sha256(code);
  user.resetTokenExpires = new Date(Date.now() + CODE_TTL_MS);
  user.resetAttempts = 0;
  await user.save();

  const page = `${env.frontendUrl}/admin/reset-password`;
  await sendMail({
    to: user.email,
    subject: `${code} is your Di-Grow password reset code`,
    text: `Hello ${user.name},\n\nYour password reset code is: ${code}\n\nEnter it on ${page} within 10 minutes to choose a new password.\n\nIf you did not ask for this, you can ignore this email; your password stays the same.`,
    html: `<p>Hello ${user.name},</p><p>Your password reset code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;font-family:monospace">${code}</p><p>Enter it on <a href="${page}">the reset page</a> within 10 minutes to choose a new password.</p><p style="color:#64748b;font-size:12px">If you did not ask for this, you can ignore this email; your password stays the same.</p>`,
  });
  return res.json(reply);
});

/**
 * Load the user whose current reset code matches. A wrong code counts as an attempt and the
 * fifth wrong one discards the code, so the 100 000 possibilities cannot be brute-forced.
 */
async function userForResetCode(email, code) {
  const invalid = () => ApiError.badRequest('That code is wrong or has expired. Request a new one.');
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+resetTokenHash +resetTokenExpires +resetAttempts +passwordHash');
  if (!user || !user.resetTokenHash || !user.resetTokenExpires || user.resetTokenExpires < new Date()) throw invalid();

  if (user.resetTokenHash !== sha256(code)) {
    user.resetAttempts = (user.resetAttempts || 0) + 1;
    if (user.resetAttempts >= CODE_MAX_ATTEMPTS) {
      user.resetTokenHash = undefined;
      user.resetTokenExpires = undefined;
      user.resetAttempts = 0;
      await user.save();
      throw ApiError.badRequest('Too many wrong codes. Request a new code.');
    }
    await user.save();
    throw invalid();
  }
  return user;
}

/** Step 1 on the reset page: confirm the code is right before the password fields are shown. The code stays valid. */
export const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  await userForResetCode(email, code);
  res.json({ success: true, data: { message: 'Code verified. Choose a new password.' } });
});

/** Step 2: the same code plus the new password. The code is consumed here. */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  const user = await userForResetCode(email, code);

  await user.setPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  user.resetAttempts = 0;
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
