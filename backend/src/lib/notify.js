import { Notification } from '../models/index.js';
import { emitAdmin } from '../socket/index.js';

/** Persist a notification for the bell and push it to connected dashboards. */
export async function pushNotification({ type, title, message, orderId }) {
  const n = await Notification.create({ type, title, message, orderId });
  emitAdmin('notification:new', n.toJSON());
  return n;
}

export default pushNotification;
