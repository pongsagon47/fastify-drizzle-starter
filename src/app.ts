import { createRequire } from 'node:module';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// Config
import { env } from '@/config/env';

// Middlewares
import { errorHandler } from '@/middlewares/errorHandler';

// Plugins
import { corsPlugin } from '@/plugins/cors';
import { jwtPlugin } from '@/plugins/jwt';
import { swaggerPlugin } from '@/plugins/swagger';
import { mailerPlugin } from '@/plugins/mailer';
import { rateLimitPlugin } from '@/plugins/rate-limit';
import { multipartPlugin } from '@/plugins/multipart';
import { helmetPlugin } from '@/plugins/helmet';

// Modules
import { usersRoutes } from '@/modules/users/users.route';
import { authRoutes } from '@/modules/auth/auth.route';
import { devRoutes } from '@/modules/dev/dev.route';

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
  app.register(helmetPlugin);
  app.register(corsPlugin);
  app.register(jwtPlugin);
  app.register(swaggerPlugin);
  app.register(mailerPlugin);
  app.register(rateLimitPlugin);
  app.register(multipartPlugin);
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