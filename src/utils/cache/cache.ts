import { redis } from '@/config/redis';
import { env } from '@/config/env';

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache<T>(key: string, value: T, ttl = env.REDIS_TTL): Promise<void> {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

export async function delCache(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  await redis.del(...keys);
}

export async function delCacheByPattern(pattern: string): Promise<void> {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
