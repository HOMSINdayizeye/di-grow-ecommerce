import { env } from '../config/env.js';
import { User, Settings } from '../models/index.js';
import { logger } from './logger.js';

/**
 * First start on a fresh database (for example a new Render service with no shell to run the
 * seed): create the first admin from ADMIN_EMAIL / ADMIN_PASSWORD and the default settings row.
 * Does nothing once any user exists, so it never overwrites a changed password.
 */
export async function ensureFirstAdmin() {
  if (await User.exists({})) return null;
  const admin = new User({ name: env.admin.name, email: env.admin.email, role: 'admin', isActive: true });
  await admin.setPassword(env.admin.password);
  await admin.save();
  await Settings.get();
  logger.info(`No users found: created the first admin ${admin.email} from ADMIN_EMAIL / ADMIN_PASSWORD`);
  if (env.isProd && env.admin.password === 'admin123') {
    logger.warn('ADMIN_PASSWORD is still the default "admin123". Change it under Admin > Staff right away.');
  }
  return admin;
}

export default ensureFirstAdmin;
