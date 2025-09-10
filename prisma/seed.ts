import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedPermissions } from './seeds/permission.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed permissions first
  console.log('📋 Seeding permissions...');
  await seedPermissions(prisma);

  // Create admin role with all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        connect: await prisma.permission.findMany().then(permissions => 
          permissions.map(p => ({ id: p.id }))
        )
      }
    },
  });

  // Create user role with basic permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: {
        connect: [
          { name: 'get_permissions' },
          { name: 'get_permission' }
        ]
      }
    },
  });

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
      role: {
        connect: { id: adminRole.id }
      }
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
      role: {
        connect: { id: userRole.id }
      }
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
