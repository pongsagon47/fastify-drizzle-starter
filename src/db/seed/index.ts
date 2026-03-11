import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '@/config/database';
import { users, posts } from '@/db/schema/index';

async function seed() {
  console.log('🌱 Seeding database...');

  // --- Users ---
  const hashedPassword = await bcrypt.hash('password123', 10);

  const insertedUsers = await db.insert(users).values([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
    {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
    },
    {
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
    },
    {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: false,
    },
  ]);

  const adminId = insertedUsers[0].insertId;
  const aliceId = adminId + 1;
  const bobId = adminId + 2;

  console.log(`✅ Inserted ${insertedUsers[0].affectedRows} users`);

  // --- Posts ---
  await db.insert(posts).values([
    {
      title: 'Getting Started with Fastify',
      content: 'Fastify is a fast and low overhead web framework for Node.js...',
      userId: adminId,
      createdBy: adminId,
      updatedBy: adminId,
    },
    {
      title: 'Drizzle ORM Tips',
      content: 'Drizzle ORM provides a type-safe query builder for TypeScript...',
      userId: aliceId,
      createdBy: aliceId,
      updatedBy: aliceId,
    },
    {
      title: 'Redis Caching Strategies',
      content: 'Effective caching can dramatically improve API performance...',
      userId: bobId,
      createdBy: bobId,
      updatedBy: bobId,
    },
  ]);

  console.log('✅ Inserted 3 posts');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   admin@example.com  / password123  (admin)');
  console.log('   alice@example.com  / password123  (user)');
  console.log('   bob@example.com    / password123  (user)');
  console.log('');
  console.log('✨ Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
