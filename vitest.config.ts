import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/__tests__/setup.ts'],
    env: {
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_USER: 'test',
      DB_PASSWORD: 'test',
      DB_NAME: 'test',
      JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/db/migrations/**',
        'src/types/**',
      ],
    },
  },
});
