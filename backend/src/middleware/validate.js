import { ApiError } from '../lib/ApiError.js';

/**
 * Validate req[source] with a zod schema. The parsed (coerced, trimmed) value
 * replaces the original so controllers only ever see clean input.
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      const first = errors[0];
      const message = first?.path ? `${first.message}` : first?.message || 'Invalid input';
      return next(ApiError.badRequest(message, errors));
    }
    req[source] = result.data;
    return next();
  };

export default validate;
