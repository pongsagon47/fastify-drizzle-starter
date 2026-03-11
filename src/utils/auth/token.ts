import { randomBytes } from 'node:crypto';
import { redis } from '@/config/redis';

const REFRESH_PREFIX = 'refresh:';
const BLACKLIST_PREFIX = 'blacklist:';

export type RefreshPayload = { userId: number; email: string; role: string };

export function parseTtlToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900;
  const value = parseInt(match[1]);
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * units[match[2]];
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

// --- Password Reset ---

const RESET_PREFIX = 'reset:';

export async function storeResetToken(token: string, userId: number, ttl: number): Promise<void> {
  if (!redis) return;
  await redis.set(`${RESET_PREFIX}${token}`, String(userId), 'EX', ttl);
}

export async function getResetUserId(token: string): Promise<number | null> {
  if (!redis) return null;
  const data = await redis.get(`${RESET_PREFIX}${token}`);
  if (!data) return null;
  return parseInt(data);
}

export async function deleteResetToken(token: string): Promise<void> {
  if (!redis) return;
  await redis.del(`${RESET_PREFIX}${token}`);
}

export async function storeRefreshToken(token: string, payload: RefreshPayload, ttl: number): Promise<void> {
  if (!redis) return;
  await redis.set(`${REFRESH_PREFIX}${token}`, JSON.stringify(payload), 'EX', ttl);
}

export async function getRefreshPayload(token: string): Promise<RefreshPayload | null> {
  if (!redis) return null;
  const data = await redis.get(`${REFRESH_PREFIX}${token}`);
  if (!data) return null;
  return JSON.parse(data) as RefreshPayload;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  if (!redis) return;
  await redis.del(`${REFRESH_PREFIX}${token}`);
}

export async function blacklistAccessToken(jti: string, ttl: number): Promise<void> {
  if (!redis || ttl <= 0) return;
  await redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttl);
}

export async function isBlacklisted(jti: string): Promise<boolean> {
  if (!redis) return false;
  return (await redis.get(`${BLACKLIST_PREFIX}${jti}`)) !== null;
}
