import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import { env } from '@/config/env';

export const helmetPlugin = fp(async (app) => {
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });
});
