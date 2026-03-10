import { readFileSync } from 'node:fs';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '@/config/env.js';
import * as schema from '@/db/schema/index.js';

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

export async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}
