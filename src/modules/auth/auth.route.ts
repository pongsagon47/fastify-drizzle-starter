import type { FastifyInstance } from 'fastify';
import { AuthService } from '@/modules/auth/auth.service.js';
import { authenticate } from '@/middlewares/authenticate.js';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginZod } from '@/modules/auth/auth.schema.js';

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(app);
  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /auth/login
  zApp.post('/login', {
    schema: {
      body: loginZod,
      tags: ['Auth'],
      summary: 'Login',
    },
    handler: async (req, reply) => {
      const result = await service.login(req.body);
      return reply.send(result);
    },
  });

  // GET /auth/me — ดู profile ตัวเอง
  zApp.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current user',
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const user = req.user as { id: number; };
      const result = await service.me(user.id);
      return reply.send(result);
    },
  });
}
