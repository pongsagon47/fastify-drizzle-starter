import { int, timestamp, varchar } from 'drizzle-orm/mysql-core';

// Primary key มาตรฐาน
export const primaryId = {
  id: int('id').primaryKey().autoincrement(),
};

// Timestamp มาตรฐาน
export const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
};


// Soft delete
export const softDelete = {
  deletedAt: timestamp('deleted_at'),
};

// Timestamp with soft delete
export const timestampsWithSoftDelete = {
  ...timestamps,
  ...softDelete,
};

// Audit columns — รู้ว่าใครสร้าง/แก้
export const audit = {
  createdBy: int('created_by'),
  updatedBy: int('updated_by'),
};