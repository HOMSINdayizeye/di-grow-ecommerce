import crypto from 'node:crypto';

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Produce a slug that does not collide with an existing document (optionally excluding one id). */
export async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base) || crypto.randomBytes(3).toString('hex');
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    if (!(await Model.exists(q))) return slug;
    slug = `${root}-${n++}`;
  }
}

/** Keep only the last 9 digits of a Rwandan number and prefix +250. */
export const normalisePhone = (v) => {
  const digits = String(v || '').replace(/\D/g, '');
  const tail = digits.slice(-9);
  return tail ? `+250${tail}` : '';
};

export const last9 = (v) => String(v || '').replace(/\D/g, '').slice(-9);

export const randomToken = (bytes = 24) => crypto.randomBytes(bytes).toString('hex');
export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Parse page/limit query values with sane bounds. */
export function pageParams(query, defaultLimit = 12, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export const meta = (page, limit, total) => ({ page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });

/** End of a YYYY-MM-DD day (inclusive upper bound for date filters). */
export const endOfDay = (ymd) => new Date(`${ymd}T23:59:59.999`);

export const isTrue = (v) => v === true || v === 'true' || v === '1';
