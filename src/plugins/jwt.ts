import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '@/config/env.js';

export const jwtPlugin = fp(async (app) => {
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });
});