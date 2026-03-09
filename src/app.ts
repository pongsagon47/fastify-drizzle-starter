import { createRequire } from 'node:module';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from '@/config/env.js';
import { errorHandler } from '@/middlewares/errorHandler.js'; // ✅ import จากข้างนอก
import { usersRoutes } from '@/modules/users/users.route.js';
import { authRoutes } from '@/modules/auth/auth.route.js';

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
  app.register(cors, {
    origin: env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  app.register(jwt, { secret: env.JWT_SECRET });

  app.register(swagger, {
    openapi: {
      info: { title: 'My API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' },
    logLevel: 'warn',
  });

  // --- Routes ---
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(usersRoutes, { prefix: '/api/v1/users' });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // --- Error Handler ---
  app.setErrorHandler(errorHandler); // ✅ บรรทัดเดียว

  return app;
}