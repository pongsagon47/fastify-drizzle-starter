import fp from 'fastify-plugin';
import type { Redis } from 'ioredis';
import { redis } from '@/config/redis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis | null;
  }
}

export const redisPlugin = fp(async (app) => {
  if (!redis) {
    app.log.warn('⚠️  Redis not configured — caching disabled');
    app.decorate('redis', null);
    return;
  }

  try {
    await redis.connect();
    app.log.info('✅ Redis connected');
  } catch (err) {
    app.log.error({ err }, '❌ Redis connection failed — caching disabled');
    app.decorate('redis', null);
    return;
  }

  redis.on('error', (err) => app.log.error({ err }, 'Redis error'));

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    await redis!.quit();
  });
}, { name: 'redis' });
