import fp from 'fastify-plugin';
import type { QueueConnectionOptions } from '@/queues/connection';
import { createQueueConnection } from '@/queues/connection';
import { createEmailWorker } from '@/queues/email/worker';

export const queuePlugin = fp(async (app) => {
  const connection: QueueConnectionOptions | null = createQueueConnection();

  if (!connection) {
    app.log.warn('⚠️  Queue not started — Redis not configured');
    return;
  }

  if (!app.mailer) {
    app.log.warn('⚠️  Queue not started — Mailer not configured');
    return;
  }

  const emailWorker = createEmailWorker(connection, app.mailer);

  emailWorker.on('completed', (job) => {
    app.log.info({ jobId: job.id, type: job.name }, '✅ Email job completed');
  });

  emailWorker.on('failed', (job, err) => {
    app.log.error({ jobId: job?.id, type: job?.name, err }, '❌ Email job failed');
  });

  app.log.info('✅ Email queue worker started');

  app.addHook('onClose', async () => {
    await emailWorker.close();
  });
}, { name: 'queue', dependencies: ['mailer'] });
