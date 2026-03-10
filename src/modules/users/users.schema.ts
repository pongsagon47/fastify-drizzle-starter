import { z } from 'zod';

// --- Zod schemas (ใช้ใน service/validation) ---
export const createUserZod = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).default('user'),
  // avatar: z.string().optional(),
});

export const updateUserZod = createUserZod.partial().omit({ password: true });

export const userParamsZod = z.object({
  id: z.coerce.number().int().positive(),
});

export const userQueryZod = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
});

// TypeScript types
export type CreateUserDto = z.infer<typeof createUserZod>;
export type UpdateUserDto = z.infer<typeof updateUserZod>;
export type UserParams = z.infer<typeof userParamsZod>;
export type UserQuery = z.infer<typeof userQueryZod>;