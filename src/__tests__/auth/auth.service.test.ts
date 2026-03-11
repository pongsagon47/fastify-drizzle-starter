import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/modules/auth/auth.service';
import * as repo from '@/modules/users/users.repository';
import * as bcryptModule from 'bcrypt';
import { UnauthorizedError } from '@/shared/errors';

// Mock ทั้ง repository และ bcrypt
vi.mock('@/modules/users/users.repository');
vi.mock('bcrypt');

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'user',
  isActive: true,
  avatar: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockApp = {
  jwt: {
    sign: vi.fn().mockReturnValue('mock_access_token'),
  },
} as any;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockApp);

    vi.mocked(repo.UsersRepository.prototype.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcryptModule.compare).mockResolvedValue(true as never);
  });

  describe('login', () => {
    it('returns accessToken, refreshToken, and user on valid credentials', async () => {
      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toHaveLength(64); // 32 bytes hex
      expect(result.user).toMatchObject({ id: 1, email: 'test@example.com', role: 'user' });
    });

    it('throws UnauthorizedError when user not found', async () => {
      vi.mocked(repo.UsersRepository.prototype.findByEmail).mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', password: '123' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when user is inactive', async () => {
      vi.mocked(repo.UsersRepository.prototype.findByEmail).mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login({ email: 'test@example.com', password: '123' }))
        .rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when password is wrong', async () => {
      vi.mocked(bcryptModule.compare).mockResolvedValue(false as never);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedError when refresh token not found in Redis (Redis disabled)', async () => {
      // Redis is null in test (mocked in setup.ts) → getRefreshPayload returns null
      await expect(service.refresh({ refreshToken: 'invalid_token' }))
        .rejects.toThrow(UnauthorizedError);
    });
  });
});
