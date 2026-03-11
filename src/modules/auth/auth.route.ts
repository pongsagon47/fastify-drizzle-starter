import type { FastifyInstance } from 'fastify';
import { AuthService } from '@/modules/auth/auth.service';
import { authenticate } from '@/middlewares/authenticate';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginZod, refreshTokenZod, logoutZod, forgotPasswordZod, resetPasswordZod } from '@/modules/auth/auth.schema';
import { successResponse } from '@/shared/response';

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(app);
  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /auth/login
  zApp.post('/login', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' },
    },
    schema: {
      body: loginZod,
      tags: ['Auth'],
      summary: 'Login — returns accessToken (15m) + refreshToken (7d)',
    },
    handler: async (req, reply) => {
      const result = await service.login(req.body);
      return reply.send(successResponse(result, 'Logged in successfully'));
    },
  });

  // POST /auth/refresh
  zApp.post('/refresh', {
    config: {
      rateLimit: { max: 10, timeWindow: '1 minute' },
    },
    schema: {
      body: refreshTokenZod,
      tags: ['Auth'],
      summary: 'Refresh access token (rotates refresh token)',
    },
    handler: async (req, reply) => {
      const result = await service.refresh(req.body);
      return reply.send(successResponse(result, 'Token refreshed successfully'));
    },
  });

  // POST /auth/logout
  zApp.post('/logout', {
    schema: {
      body: logoutZod,
      tags: ['Auth'],
      summary: 'Logout — revokes access token and refresh token',
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      await service.logout(req.user.jti, req.user.exp, req.body);
      return reply.send(successResponse(null, 'Logged out successfully'));
    },
  });

  // POST /auth/forgot-password
  zApp.post('/forgot-password', {
    config: {
      rateLimit: { max: 3, timeWindow: '15 minutes' },
    },
    schema: {
      body: forgotPasswordZod,
      tags: ['Auth'],
      summary: 'Request password reset — sends email with reset link (30 min expiry)',
    },
    handler: async (req, reply) => {
      const result = await service.forgotPassword(req.body, app.mailer);
      // response เหมือนกันเสมอ ไม่ว่า email จะมีหรือไม่
      return reply.send(successResponse(result, 'If the email exists, a reset link has been sent'));
    },
  });

  // POST /auth/reset-password
  zApp.post('/reset-password', {
    config: {
      rateLimit: { max: 5, timeWindow: '15 minutes' },
    },
    schema: {
      body: resetPasswordZod,
      tags: ['Auth'],
      summary: 'Reset password using token from email',
    },
    handler: async (req, reply) => {
      await service.resetPassword(req.body);
      return reply.send(successResponse(null, 'Password reset successfully'));
    },
  });

  // GET /auth/me
  zApp.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current user',
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const userInfo = await service.me(req.user.id);
      return reply.send(successResponse(userInfo, 'Retrieved user successfully'));
    },
  });
}
