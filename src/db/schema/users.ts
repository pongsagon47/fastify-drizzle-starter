import { mysqlTable, varchar, boolean } from 'drizzle-orm/mysql-core';
import { timestampsWithSoftDelete, primaryId } from '../helpers/columns.helpers';

export const users = mysqlTable('users', {
  ...primaryId,
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 255 }).notNull().default(''),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampsWithSoftDelete,
});

// TypeScript types derived from schema — no need to define separately
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserWithoutPassword = Omit<User, 'password'>;
