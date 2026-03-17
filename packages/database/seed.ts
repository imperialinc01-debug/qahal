import { PrismaClient, TenantPlan, UserRole, MemberStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Grace Community Church',
      subdomain: 'grace',
      plan: TenantPlan.GROWTH,
      status: 'ACTIVE',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      settings: {
        brandColor: '#2E75B6',
        welcomeMessage: 'Welcome to Grace Community Church!',
      },
    },
  });

  console.log(`  ✅ Tenant: ${tenant.name} (${tenant.subdomain})`);

  // Create admin user
  // NOTE: Replace with a proper bcrypt hash in production
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@grace.qahal.app',
      passwordHash: '$2b$10$placeholder_hash_replace_me',
      role: UserRole.PASTOR,
      firstName: 'John',
      lastName: 'Pastor',
    },
  });

  console.log(`  ✅ Admin: ${admin.email}`);

  // Create sample members
  const members = await Promise.all(
    [
      { firstName: 'Sarah', lastName: 'Johnson', status: MemberStatus.MEMBER },
      { firstName: 'Michael', lastName: 'Williams', status: MemberStatus.LEADER },
      { firstName: 'Grace', lastName: 'Davis', status: MemberStatus.WORKER },
      { firstName: 'David', lastName: 'Brown', status: MemberStatus.VISITOR },
      { firstName: 'Ruth', lastName: 'Martinez', status: MemberStatus.NEW_CONVERT },
    ].map((m) =>
      prisma.member.create({
        data: {
          tenantId: tenant.id,
          ...m,
          email: `${m.firstName.toLowerCase()}@example.com`,
          dateOfBirth: new Date('1990-06-15'),
          joinedDate: new Date(),
        },
      }),
    ),
  );

  console.log(`  ✅ Members: ${members.length} created`);
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
