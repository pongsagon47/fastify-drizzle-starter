import { z } from 'zod';

export const loginZod = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginZod>;