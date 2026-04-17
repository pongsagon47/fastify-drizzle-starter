import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import type { Transporter } from 'nodemailer';
import { UsersRepository } from '@/modules/users/users.repository';
import { UnauthorizedError, BadRequestError, AppError } from '@/shared/errors';
import type { LoginDto, RefreshTokenDto, LogoutDto, ForgotPasswordDto, ResetPasswordDto } from '@/modules/auth/auth.schema';
import { env } from '@/config/env';
import { redis } from '@/config/redis';
import {
  parseTtlToSeconds,
  generateOpaqueToken,
  storeRefreshToken,
  getRefreshPayload,
  deleteRefreshToken,
  blacklistAccessToken,
  storeResetToken,
  getResetUserId,
  deleteResetToken,
} from '@/utils/auth/token';
import { sendResetPasswordMail } from '@/utils/mailer/mailer';
import { addEmailJob } from '@/queues/email/queue';
import { delCache } from '@/utils/cache/cache';

const repo = new UsersRepository();

export class AuthService {
  constructor(private app: FastifyInstance) {}

  async login(data: LoginDto) {
    const user = await repo.findByEmail(data.email);
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');

    const jti = randomBytes(16).toString('hex');
    const accessToken = this.app.jwt.sign(
      { id: user.id, email: user.email, role: user.role, jti },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = generateOpaqueToken();
    const refreshTtl = parseTtlToSeconds(env.JWT_REFRESH_EXPIRES_IN);
    await storeRefreshToken(refreshToken, { userId: user.id, email: user.email, role: user.role }, refreshTtl);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async refresh(data: RefreshTokenDto) {
    const payload = await getRefreshPayload(data.refreshToken);
    if (!payload) throw new UnauthorizedError('Invalid or expired refresh token');

    // Rotate: delete old token, issue new pair
    await deleteRefreshToken(data.refreshToken);

    const jti = randomBytes(16).toString('hex');
    const accessToken = this.app.jwt.sign(
      { id: payload.userId, email: payload.email, role: payload.role, jti },
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const newRefreshToken = generateOpaqueToken();
    const refreshTtl = parseTtlToSeconds(env.JWT_REFRESH_EXPIRES_IN);
    await storeRefreshToken(newRefreshToken, payload, refreshTtl);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(jti: string, exp: number, data?: LogoutDto) {
    const now = Math.floor(Date.now() / 1000);
    await blacklistAccessToken(jti, exp - now);
    if (data?.refreshToken) await deleteRefreshToken(data.refreshToken);
  }

  async forgotPassword(data: ForgotPasswordDto, mailer: Transporter | null) {
    if (!redis) throw new AppError('Password reset requires Redis to be configured', 503, 'SERVICE_UNAVAILABLE');

    const user = await repo.findByEmail(data.email);
    // ไม่ expose ว่า email มีหรือไม่ (prevent email enumeration)
    if (!user || !user.isActive) return null;

    const token = generateOpaqueToken();
    await storeResetToken(token, user.id, env.PASSWORD_RESET_EXPIRES_IN);

    const resetLink = `${env.APP_URL}/reset-password?token=${token}`;
    const queued = await addEmailJob({
      type: 'reset-password',
      to: user.email,
      name: user.name,
      resetLink,
      expiresIn: '30 นาที',
    });

    // Fallback: ส่งตรงถ้าไม่มี queue (Redis ไม่ได้ config)
    if (!queued && mailer) {
      await sendResetPasswordMail(mailer, user.email, { name: user.name, resetLink, expiresIn: '30 นาที' });
    }

    // คืน token เฉพาะ development (สำหรับ test โดยไม่ต้องมี mailer)
    return env.NODE_ENV === 'development' ? { token } : null;
  }

  async resetPassword(data: ResetPasswordDto) {
    const userId = await getResetUserId(data.token);
    if (!userId) throw new BadRequestError('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await repo.updatePassword(userId, hashedPassword);
    await deleteResetToken(data.token);

    await delCache(`users:${userId}`);
  }

  async me(userId: number) {
    const user = await repo.findById(userId);
    if (!user) throw new UnauthorizedError();
    return user;
  }
}
