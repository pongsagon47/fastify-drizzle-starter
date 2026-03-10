import fp from 'fastify-plugin';
import type { Transporter } from 'nodemailer';
import { createMailTransporter } from '@/config/mailer.js';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: Transporter | null;
  }
}

export const mailerPlugin = fp(async (app) => {
  const transporter = createMailTransporter();

  if (!transporter) {
    app.log.warn('⚠️  Mailer not configured — skipping');
    app.decorate('mailer', null);
    return;
  }

  try {
    await transporter.verify();
    app.log.info('✅ Mailer connected');
  } catch (err) {
    app.log.error({ err }, '❌ Mailer connection failed');
  }

  app.decorate('mailer', transporter);

  app.addHook('onClose', async () => {
    transporter.close();
  });
}, { name: 'mailer' });