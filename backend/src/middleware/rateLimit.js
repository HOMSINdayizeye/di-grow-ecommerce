import rateLimit from 'express-rate-limit';

const json = (message) => ({
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message },
});

/** Soft global limit so a single client cannot hammer the API. */
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, ...json('Too many requests, slow down a little.') });

export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, ...json('Too many sign-in attempts. Try again in 15 minutes.') });

export const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, ...json('Too many reset requests. Try again later.') });

export const orderLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, ...json('Too many order requests from this connection. Please call us instead.') });

export const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, ...json('Too many tracking attempts. Try again in a few minutes.') });
