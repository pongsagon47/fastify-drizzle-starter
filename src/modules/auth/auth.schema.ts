import { z } from 'zod';

export const loginZod = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshTokenZod = z.object({
  refreshToken: z.string().min(1),
});

export const logoutZod = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordZod = z.object({
  email: z.email(),
});

export const resetPasswordZod = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginDto = z.infer<typeof loginZod>;
export type RefreshTokenDto = z.infer<typeof refreshTokenZod>;
export type LogoutDto = z.infer<typeof logoutZod>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordZod>;
export type ResetPasswordDto = z.infer<typeof resetPasswordZod>;
