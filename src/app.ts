import { createRequire } from 'node:module';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// Config
import { env } from '@/config/env.js';

// Middlewares
import { errorHandler } from '@/middlewares/errorHandler.js';

// Plugins
import { corsPlugin } from '@/plugins/cors.js';
import { jwtPlugin } from '@/plugins/jwt.js';
import { swaggerPlugin } from '@/plugins/swagger.js';
import { mailerPlugin } from '@/plugins/mailer.js';

// Modules
import { usersRoutes } from '@/modules/users/users.route.js';
import { authRoutes } from '@/modules/auth/auth.route.js';
import { devRoutes } from '@/modules/dev/dev.route.js';

function getLoggerTransport() {
  if (env.NODE_ENV === 'production') return undefined;
  try {
    const require = createRequire(import.meta.url);
    const target = require.resolve('pino-pretty');
    return { target, options: { colorize: true } };
  } catch {
    return undefined;
  }
}

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: getLoggerTransport(),
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // --- Plugins ---
  app.register(corsPlugin);
  app.register(jwtPlugin);
  app.register(swaggerPlugin);
  app.register(mailerPlugin);

  // --- Routes ---
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(usersRoutes, { prefix: '/api/v1/users' });
  app.register(devRoutes, { prefix: '/api/v1/dev' });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // --- Error Handler ---
  app.setErrorHandler(errorHandler); // ✅ บรรทัดเดียว

  return app;
}