import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed permissions first
  console.log('📋 Seeding permissions...');
  await seedPermissions(prisma);

  // Seed roles
  console.log('📋 Seeding roles...');
  await seedRoles(prisma);

  // System roles are created by the role seeder
  console.log('🔑 System roles created by role seeder');

  // Find the roles created by the seeder
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: 'super_admin',
      context: 'PLATFORM',
      contextId: null
    }
  });

  const verifiedTalentRole = await prisma.role.findFirst({
    where: {
      name: 'verified_talent',
      context: 'TALENT',
      contextId: null
    }
  });

  const companyAdminTemplate = await prisma.role.findFirst({
    where: {
      name: 'company_admin',
      context: 'COMPANY',
      contextId: null
    }
  });

  if (!superAdminRole || !verifiedTalentRole || !companyAdminTemplate) {
    throw new Error('System roles not found. Make sure role seeder ran successfully.');
  }

  console.log('👤 Creating users...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      emailVerified: true,
      roles: {
        connect: { id: superAdminRole.id }
      }
    },
  });

  // Create regular talent user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const talentUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Talent',
      password: userPassword,
      emailVerified: true,
      roles: {
        connect: { id: verifiedTalentRole.id }
      }
    },
  });

  // Create talent profile for the user
  await prisma.talent.upsert({
    where: { userId: talentUser.id },
    update: {},
    create: {
      userId: talentUser.id,
      description: 'Experienced software developer',
      country: 'Ghana',
      city: 'Accra',
      profession: 'GRADUATE',
      availability: true,
      vetted: false,
      new: true
    },
  });

  // Create a sample company
  const sampleCompany = await prisma.company.upsert({
    where: { slug: 'tech-corp' },
    update: {},
    create: {
      name: 'Tech Corp',
      slug: 'tech-corp',
      overview: 'A leading technology company',
      country: 'Ghana',
      city: 'Accra',
      website: 'https://techcorp.com',
      companySize: '50-100',
      isActive: true
    },
  });

  // Create company admin user
  const companyAdminPassword = await bcrypt.hash('companyadmin123', 10);
  
  const companyAdminUser = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com' },
    update: {},
    create: {
      email: 'admin@techcorp.com',
      name: 'Company Admin',
      password: companyAdminPassword,
      emailVerified: true
    },
  });

  // Get template permissions
  const templateWithPermissions = await prisma.role.findUnique({
    where: { id: companyAdminTemplate.id },
    include: { permissions: true }
  });

  // Find or create company-specific admin role
  let companySpecificAdminRole = await prisma.role.findFirst({
    where: {
      name: 'company_admin',
      context: 'COMPANY',
      contextId: sampleCompany.id
    }
  });

  if (!companySpecificAdminRole) {
    companySpecificAdminRole = await prisma.role.create({
      data: {
        name: 'company_admin',
        description: 'Administrator for Tech Corp',
        context: 'COMPANY',
        contextId: sampleCompany.id,
        isSystem: false,
        permissions: {
          connect: templateWithPermissions?.permissions.map(p => ({ id: p.id })) || []
        }
      },
    });
  }

  // Connect company admin user to the company role
  await prisma.user.update({
    where: { id: companyAdminUser.id },
    data: {
      roles: {
        connect: { id: companySpecificAdminRole.id }
      }
    }
  });

  // Create company membership if it doesn't exist
  const existingMembership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId: companyAdminUser.id,
        companyId: sampleCompany.id
      }
    }
  });

  if (!existingMembership) {
    await prisma.companyMembership.create({
      data: {
        userId: companyAdminUser.id,
        companyId: sampleCompany.id,
        joinedAt: new Date(),
        isActive: true
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Super Admin: admin@example.com / admin123');
  console.log('👤 Talent User: user@example.com / user123');
  console.log('👤 Company Admin: admin@techcorp.com / companyadmin123');
  console.log('🏢 Sample Company: Tech Corp');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
