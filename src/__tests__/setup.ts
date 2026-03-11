import { vi } from 'vitest';

// Mock Redis — ป้องกัน ioredis พยายามเชื่อมต่อจริงใน test
vi.mock('@/config/redis', () => ({ redis: null }));

// Mock Database — ป้องกัน mysql2 พยายามเชื่อมต่อจริงใน test
vi.mock('@/config/database', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
  checkDatabaseConnection: vi.fn().mockResolvedValue(undefined),
  connectConfig: vi.fn().mockReturnValue({}),
}));
