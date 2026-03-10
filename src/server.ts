import 'dotenv/config';
import { buildApp } from '@/app.js';
import { checkDatabaseConnection, db } from '@/config/database.js';
import { env } from '@/config/env.js';
import { sql } from 'drizzle-orm';

const app = buildApp();

const start = async () => {
  // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
  await checkDatabaseConnection();

  // เริ่ม server
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📖 Swagger docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down...`);
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
