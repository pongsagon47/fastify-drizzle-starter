import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@/shared/errors';
import { isBlacklisted } from '@/utils/auth/token';

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const { jti } = request.user;
  if (jti && await isBlacklisted(jti)) {
    throw new UnauthorizedError('Token has been revoked');
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const { role } = request.user;
    if (!roles.includes(role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
  };
}
