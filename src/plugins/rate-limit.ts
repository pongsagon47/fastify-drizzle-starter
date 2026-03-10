import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
// import { createClient } from 'redis';

export const rateLimitPlugin = fp(async (app) => {
  // const redisClient = createClient({ url: "" })
  await app.register(rateLimit, {
    global: true,          // apply ทุก route
    max: 100,              // 100 requests
    timeWindow: '1 minute',
    // redis: redisClient,
  });
});