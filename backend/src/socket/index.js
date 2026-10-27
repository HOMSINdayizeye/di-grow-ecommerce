import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

let io = null;

/**
 * Admin namespace: the dashboard connects with { auth: { token } } and listens
 * for `order:new` and `notification:new`. Anyone without a valid staff token is refused.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  const admin = io.of('/admin');
  admin.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const user = await authenticateToken(token);
    if (!user) return next(new Error('unauthorized'));
    socket.data.user = { _id: String(user._id), name: user.name, role: user.role };
    return next();
  });
  admin.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.data.user.name}`);
    socket.on('disconnect', () => logger.info(`socket disconnected: ${socket.data.user.name}`));
  });
  return io;
}

/** Broadcast to every connected admin/staff dashboard. Safe to call before init. */
export function emitAdmin(event, payload) {
  if (!io) return;
  io.of('/admin').emit(event, payload);
}

export function closeSocket() {
  return new Promise((resolve) => (io ? io.close(() => resolve()) : resolve()));
}
