import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with NestJS',
        content: 'This is a sample post about NestJS...',
        published: true,
        authorId: adminUser.id,
      },
      {
        title: 'Understanding Prisma',
        content: 'This post explains how to use Prisma...',
        published: true,
        authorId: regularUser.id,
      },
      {
        title: 'Draft Post',
        content: 'This is a draft post...',
        published: false,
        authorId: regularUser.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@example.com / admin123');
  console.log('👤 Regular user: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
