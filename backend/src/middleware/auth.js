import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export function signToken(user, { remember = false } = {}) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: remember ? env.jwtRememberExpiresIn : env.jwtExpiresIn,
  });
}

/**
 * Resolve a bearer token to an active user. Returns null instead of throwing so
 * both the HTTP middleware and the socket handshake can share it.
 */
export async function authenticateToken(token) {
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
  const user = await User.findById(payload.sub).select('+passwordChangedAt');
  if (!user || !user.isActive) return null;
  // Tokens issued before the last password change are no longer valid.
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000) return null;
  return user;
}

const bearer = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
};

/** Require a signed-in admin or staff user; sets req.user. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const user = await authenticateToken(bearer(req));
  if (!user) throw ApiError.unauthorized('Please sign in again');
  req.user = user;
  next();
});

/** Require one of the given roles (after requireAuth). */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Only administrators can do that'));
    return next();
  };

export const requireAdmin = requireRole('admin');
