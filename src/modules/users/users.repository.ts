import { eq, like, or, count, desc, isNull, and } from 'drizzle-orm';
import { db } from '@/config/database';
import { posts, users, type NewUser, type User } from '@/db/schema/index';
import type { UpdateUserDto, UserQuery } from '@/modules/users/users.schema';

// กรอง soft-deleted rows ออกเสมอ
const notDeleted = isNull(users.deletedAt);

export class UsersRepository {
  async findAll(query: UserQuery) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const searchClause = search
      ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      : undefined;

    const whereClause = searchClause ? and(notDeleted, searchClause) : notDeleted;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(users).where(whereClause).limit(limit).offset(offset),
      db.select({ total: count() }).from(users).where(whereClause),
    ]);

    return { rows, total: Number(total) };
  }

  async findById(id: number) {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), notDeleted))
      .limit(1);

    return row ?? null;
  }

  findUserWithPosts(id: number) {
    return db.query.users.findFirst({
      where: and(eq(users.id, id), notDeleted),
      with: {
        posts: {
          columns: { id: true, title: true, content: true },
          orderBy: [desc(posts.createdAt)],
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), notDeleted))
      .limit(1);

    return row ?? null;
  }

  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId);
  }

  async update(id: number, data: UpdateUserDto) {
    await db.update(users).set(data).where(and(eq(users.id, id), notDeleted));
    return this.findById(id);
  }

  async updateAvatar(id: number, avatarPath: string) {
    await db.update(users).set({ avatar: avatarPath }).where(and(eq(users.id, id), notDeleted));
    return this.findById(id);
  }

  async updatePassword(id: number, hashedPassword: string) {
    await db.update(users).set({ password: hashedPassword }).where(and(eq(users.id, id), notDeleted));
  }

  // Soft delete — ตั้ง deletedAt แทนการลบจริง
  async delete(id: number) {
    await db.update(users).set({ deletedAt: new Date() }).where(and(eq(users.id, id), notDeleted));
  }
}
