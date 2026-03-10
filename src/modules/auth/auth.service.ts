import { hash } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { UsersRepository } from '@/modules/users/users.repository';
import { UnauthorizedError } from '@/shared/errors';
import { successResponse } from '@/shared/response';
import type { LoginDto } from '@/modules/auth/auth.schema';

const repo = new UsersRepository();

export class AuthService {
  constructor(private app: FastifyInstance) { }

  async login(data: LoginDto) {
    const user = await repo.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const hashedPassword = hash('sha256', data.password);
    if (hashedPassword !== user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.app.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async me(userId: number) {
    const user = await repo.findById(userId);
    if (!user) throw new UnauthorizedError();
    return user;
  }
}
