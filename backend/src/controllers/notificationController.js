import { Notification } from '../models/index.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const list = asyncHandler(async (_req, res) => {
  const [items, unread] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ isRead: false }),
  ]);
  res.json({ success: true, data: items, meta: { unread } });
});

export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json({ success: true, data: n });
});

export const markAllRead = asyncHandler(async (_req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
  res.json({ success: true, data: { ok: true } });
});
