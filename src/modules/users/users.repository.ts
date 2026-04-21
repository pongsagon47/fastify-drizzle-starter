import { eq, like, or, count, desc, isNull, and, type SQL } from 'drizzle-orm';
import { db } from '@/config/database';
import { posts, users, type NewUser, type User } from '@/db/schema/index';
import type { UpdateUserDto, UserQuery } from '@/modules/users/users.schema';

const notDeleted = isNull(users.deletedAt);

function activeWhere(...conditions: (SQL | undefined)[]) {
  const defined = conditions.filter(Boolean) as SQL[];
  return defined.length ? and(notDeleted, ...defined) : notDeleted;
}

export class UsersRepository {
  async findAll(query: UserQuery) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const searchClause = search
      ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      : undefined;

    const whereClause = activeWhere(searchClause);

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
      .where(activeWhere(eq(users.id, id)))
      .limit(1);

    return row ?? null;
  }

  findUserWithPosts(id: number) {
    return db.query.users.findFirst({
      where: activeWhere(eq(users.id, id)),
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
      .where(activeWhere(eq(users.email, email)))
      .limit(1);

    return row ?? null;
  }

  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId);
  }

  async update(id: number, data: UpdateUserDto) {
    await db.update(users).set(data).where(activeWhere(eq(users.id, id)));
    return this.findById(id);
  }

  async updateAvatar(id: number, avatarPath: string) {
    await db.update(users).set({ avatar: avatarPath }).where(activeWhere(eq(users.id, id)));
    return this.findById(id);
  }

  async updatePassword(id: number, hashedPassword: string) {
    await db.update(users).set({ password: hashedPassword }).where(activeWhere(eq(users.id, id)));
  }

  // Soft delete — ตั้ง deletedAt แทนการลบจริง
  async delete(id: number) {
    await db.update(users).set({ deletedAt: new Date() }).where(activeWhere(eq(users.id, id)));
  }
}
