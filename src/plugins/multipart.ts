import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { UPLOAD_CONFIG } from '@/config/upload';

export const multipartPlugin = fp(async (app) => {
  await app.register(multipart, {
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.default,
    },
  });
});