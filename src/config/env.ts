import { z, flattenError } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // DATABASE
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_SSL_CERT: z.string().optional(),
  DB_SSL_KEY: z.string().optional(),
  DB_SSL_CA: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),

  // MAILER
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.email('MAIL_FROM must be a valid email address').optional(),
  MAIL_FROM_NAME: z.string().optional(),

  // REDIS
  REDIS_URL: z.string().optional(),
  REDIS_TTL: z.coerce.number().default(60),

  // APP
  APP_URL: z.string().default('http://localhost:3000'),
  PASSWORD_RESET_EXPIRES_IN: z.coerce.number().default(1800), // 30 minutes

  // MONGODB (optional — for request logging)
  MONGO_URL: z.string().optional(),
  MONGO_LOG_TTL_DAYS: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
