import { Settings, AuditLog } from '../models/index.js';
import { asyncHandler } from '../lib/asyncHandler.js';

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
