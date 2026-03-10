import { z } from 'zod';

// --- Zod schemas (ใช้ใน service/validation) ---
export const createUserZod = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).default('user'),
});

export const updateUserZod = createUserZod.partial().omit({ password: true }).extend({
  avatar: z.string().optional(),  // ← เพิ่ม
});

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

// Response types
export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;   // ← string เพราะ format แล้ว
  updatedAt: string;
};


export type UserListResponse = {
  rows: UserResponse[];
  total: number;
};