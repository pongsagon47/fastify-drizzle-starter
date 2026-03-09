import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@/shared/errors.js';

// ใช้เป็น preHandler hook สำหรับ route ที่ต้องการ auth
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// ใช้สำหรับ route ที่ต้องการ role เฉพาะ
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.user as { role: string; };
    if (!roles.includes(user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
  };
}
