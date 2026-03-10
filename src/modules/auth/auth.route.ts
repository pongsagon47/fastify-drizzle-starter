import type { FastifyInstance } from 'fastify';
import { AuthService } from '@/modules/auth/auth.service';
import { authenticate } from '@/middlewares/authenticate';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginZod } from '@/modules/auth/auth.schema';
import { successResponse } from '@/shared/response';

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(app);
  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /auth/login
  zApp.post('/login', {
    config: {
      rateLimit: {
        max: 5, // 5 requests per minute
        timeWindow: '1 minute', // 1 minute
      },
    },
    schema: {
      body: loginZod,
      tags: ['Auth'],
      summary: 'Login',
    },
    handler: async (req, reply) => {
      const { token, user } = await service.login(req.body);
      return reply.send(successResponse({
        token,
        user,
      }, 'Logged in successfully'));
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
      const authUser = req.user as { id: number; };
      const userInfo = await service.me(authUser.id);
      return reply.send(successResponse(userInfo, 'Retrieved user successfully'));
    },
  });
}
