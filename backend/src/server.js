import http from 'node:http';
import { env, assertEnv } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { createApp } from './app.js';
import { initSocket, closeSocket } from './socket/index.js';
import { startJobs, stopJobs } from './jobs/index.js';
import { logger } from './lib/logger.js';
import { logMailerStatus } from './lib/mailer.js';

async function main() {
  assertEnv();
  await connectDb();
  logMailerStatus().catch((err) => logger.warn('Mail check failed', err.message));

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  startJobs();

  server.listen(env.port, () => logger.info(`Di-Grow API listening on http://localhost:${env.port} (${env.nodeEnv})`));

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down`);
    stopJobs();
    await closeSocket();
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
