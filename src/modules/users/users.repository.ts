import { eq, like, or, count, desc } from 'drizzle-orm';
import { db } from '@/config/database';
import { posts, users, type NewUser, type User } from '@/db/schema/index';
import type { UpdateUserDto, UserQuery } from '@/modules/users/users.schema';

export class UsersRepository {
  // หา user ทั้งหมด + pagination
  async findAll(query: UserQuery) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
      : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .limit(limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(users)
        .where(whereClause),
    ]);

    return { rows, total: Number(total) };
  }

  // หา user ตาม id
  async findById(id: number) {
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        countPosts: count(posts.id),
      })
      .from(users)
      .leftJoin(posts, eq(users.id, posts.userId))
      .where(eq(users.id, id))
      .groupBy(users.id)
      .limit(1);

    return row ?? null;

  }

  // Example of using relations
  findUserWithPosts(id: number) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: {
          columns: {
            id: true,
            title: true,
            content: true,
          },
          orderBy: [desc(posts.createdAt)],
        },
      },
    });
  }

  // หา user ตาม email (รวม password สำหรับ auth)
  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return row ?? null;
  }

  // สร้าง user ใหม่
  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId);
  }

  // อัปเดต user
  async update(id: number, data: UpdateUserDto) {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.findById(id);
  }

  // users.repository.ts
  async updateAvatar(id: number, avatarPath: string) {
    await db
      .update(users)
      .set({ avatar: avatarPath })
      .where(eq(users.id, id));
    return this.findById(id);
  }

  // ลบ user
  async delete(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }
}
