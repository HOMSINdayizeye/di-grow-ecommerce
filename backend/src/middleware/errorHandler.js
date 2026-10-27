import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { ApiError } from '../lib/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Convert any error into the { success:false, message } envelope the frontend reads. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors;

  if (err.name === 'CastError') {
    status = 404;
    message = 'Not found';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    message = errors[0]?.message || 'Invalid input';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `That ${field} is already in use`;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message;
  }

  if (status >= 500) logger.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isProd || status < 500 ? {} : { stack: err.stack }),
  });
}
