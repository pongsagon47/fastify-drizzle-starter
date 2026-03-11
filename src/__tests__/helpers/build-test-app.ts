import { buildApp } from '@/app';
import type { FastifyInstance } from 'fastify';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = buildApp();
  await app.ready();
  return app;
}
