import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { mongoClient } from '@/config/mongo';
import { env } from '@/config/env';
import { LOG_COLLECTION } from '@/modules/logs/log.model';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: Db | null;
  }
}

export const mongoPlugin = fp(async (app) => {
  if (!mongoClient) {
    app.log.warn('⚠️  MongoDB not configured — request logging disabled');
    app.decorate('mongo', null);
    return;
  }

  try {
    await mongoClient.connect();
    const db = mongoClient.db();

    // TTL index — ลบ log อัตโนมัติหลัง N วัน
    await db.collection(LOG_COLLECTION).createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: env.MONGO_LOG_TTL_DAYS * 86400, background: true }
    );

    // Index สำหรับ query ตาม userId
    await db.collection(LOG_COLLECTION).createIndex({ userId: 1 }, { background: true });

    app.log.info(`✅ MongoDB connected (log TTL: ${env.MONGO_LOG_TTL_DAYS} days)`);
    app.decorate('mongo', db);

    app.addHook('onClose', async () => {
      await mongoClient!.close();
    });
  } catch (err) {
    app.log.error({ err }, '❌ MongoDB connection failed — request logging disabled');
    app.decorate('mongo', null);
  }
}, { name: 'mongo' });
