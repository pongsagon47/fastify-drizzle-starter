import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { connectConfig } from './src/config/database';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: connectConfig(),
  verbose: true,
  strict: true,
});