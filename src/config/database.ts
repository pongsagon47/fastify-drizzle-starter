import { readFileSync } from 'node:fs';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '@/config/env';
import * as schema from '@/db/schema/index';

export function connectConfig() {
  let isSsl = false;
  if (env.DB_SSL_CERT || env.DB_SSL_KEY || env.DB_SSL_CA) {
    isSsl = true;
  }
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: isSsl
      ? {
        cert: env.DB_SSL_CERT ? readFileSync(env.DB_SSL_CERT, 'utf8') : undefined,
        key: env.DB_SSL_KEY ? readFileSync(env.DB_SSL_KEY, 'utf8') : undefined,
        ca: env.DB_SSL_CA ? readFileSync(env.DB_SSL_CA, 'utf8') : undefined,
      }
      : undefined,
  };
}

const pool = mysql.createPool(connectConfig());

export const db = drizzle(pool, { schema, mode: 'default' });
export type DB = typeof db;

export async function checkDatabaseConnection(log: { info: (msg: string) => void; error: (obj: unknown, msg: string) => void }) {
  try {
    await db.execute(sql`SELECT 1`);
    log.info('✅ Database connected');
  } catch (err) {
    log.error({ err }, '❌ Database connection failed');
    process.exit(1);
  }
}
