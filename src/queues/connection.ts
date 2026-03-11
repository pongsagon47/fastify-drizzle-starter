import { env } from '@/config/env';

export type QueueConnectionOptions = {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest: null; // required by BullMQ
};

/**
 * Parse REDIS_URL เป็น connection options สำหรับ BullMQ
 * ส่ง options แทน ioredis instance เพื่อหลีกเลี่ยง version conflict
 */
export function createQueueConnection(): QueueConnectionOptions | null {
  if (!env.REDIS_URL) return null;
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
    db: url.pathname ? parseInt(url.pathname.slice(1)) || 0 : 0,
    maxRetriesPerRequest: null,
  };
}
