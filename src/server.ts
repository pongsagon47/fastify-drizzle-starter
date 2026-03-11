import 'dotenv/config';
import { buildApp } from '@/app';
import { checkDatabaseConnection } from '@/config/database';
import { env } from '@/config/env';

const app = buildApp();

const start = async () => {
  try {
    await checkDatabaseConnection(app.log);
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`📖 Swagger docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info(`${signal} received — shutting down...`);
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
