import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { primaryId, timestamps, audit } from '../helpers/columns.helpers';
import * as t from 'drizzle-orm/mysql-core';

export const posts = mysqlTable(
  'posts',
  {
    ...primaryId,
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    userId: int('user_id').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    ...timestamps,
    ...audit,
  },
  (table) => [
    t.index('title_index').on(table.title),
  ]
);