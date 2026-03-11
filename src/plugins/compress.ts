import fp from 'fastify-plugin';
import compress from '@fastify/compress';

export const compressPlugin = fp(async (app) => {
  app.register(compress, {
    global: true,
    encodings: ['br', 'gzip', 'deflate'],
  });
});
