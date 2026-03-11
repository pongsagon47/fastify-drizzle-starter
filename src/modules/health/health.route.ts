import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '@/config/database';

type ServiceStatus = { status: 'ok' | 'error'; responseTimeMs?: number; error?: string };

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { status: 'ok', responseTimeMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

async function checkRedis(app: FastifyInstance): Promise<ServiceStatus> {
  if (!app.redis) return { status: 'ok', responseTimeMs: 0 };  // ไม่ได้ config = ไม่ check
  const start = Date.now();
  try {
    await app.redis.ping();
    return { status: 'ok', responseTimeMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_req, reply) => {
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis(app),
    ]);

    const allOk = database.status === 'ok' && redis.status === 'ok';
    const status = allOk ? 'ok' : 'degraded';

    return reply
      .code(allOk ? 200 : 503)
      .send({
        status,
        timestamp: new Date().toISOString(),
        services: { database, redis },
      });
  });
}
