import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { redis } from '@/config/redis';

export const rateLimitPlugin = fp(async (app) => {
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    ...(redis ? { redis } : {}),
  });

  app.log.info(redis ? '✅ Rate limit using Redis store' : 'ℹ️  Rate limit using in-memory store');
});