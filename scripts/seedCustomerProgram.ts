import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const prisma = new PrismaClient();
const TEST_PASSWORD = 'Test1234!';
const SUMMER_START = new Date('2026-07-01T10:00:00.000Z');
const SUMMER_MID = new Date('2026-07-15T14:00:00.000Z');
const SUMMER_LATE = new Date('2026-08-10T11:00:00.000Z');

interface SeedCustomer {
  email: string;
  fullName: string;
  phone: string;
  birthday: Date;
  loyaltyTier: number;
  inkCredits: number;
  isVip?: boolean;
  loyaltyVipFromCard?: boolean;
  invitedByEmail?: string;
}

const seedCustomers: SeedCustomer[] = [
  {
    email: 'martina.kovacova@test.sk',
    fullName: 'Martina Kováčová',
    phone: '+421 901 111 001',
    birthday: new Date('1995-03-12'),
    loyaltyTier: 5,
    inkCredits: 400,
  },
  {
    email: 'peter.novak@test.sk',
    fullName: 'Peter Novák',
    phone: '+421 902 222 002',
    birthday: new Date('1992-08-24'),
    loyaltyTier: 2,
    inkCredits: 300,
  },
  {
    email: 'zuzana.horvathova@test.sk',
    fullName: 'Zuzana Horváthová',
    phone: '+421 903 333 003',
    birthday: new Date('1998-11-05'),
    loyaltyTier: 7,
    inkCredits: 200,
  },
  {
    email: 'jakub.mraz@test.sk',
    fullName: 'Jakub Mráz',
    phone: '+421 904 444 004',
    birthday: new Date('1990-01-18'),
    loyaltyTier: 10,
    inkCredits: 150,
    isVip: true,
    loyaltyVipFromCard: true,
  },
  {
    email: 'lucia.benesova@test.sk',
    fullName: 'Lucia Benešová',
    phone: '+421 905 555 005',
    birthday: new Date('1996-06-30'),
    loyaltyTier: 3,
    inkCredits: 250,
  },
  {
    email: 'tomas.varga@test.sk',
    fullName: 'Tomáš Varga',
    phone: '+421 906 666 006',
    birthday: new Date('1993-12-09'),
    loyaltyTier: 1,
    inkCredits: 100,
  },
  {
    email: 'nina.soukupova@test.sk',
    fullName: 'Nina Soukupová',
    phone: '+421 907 777 007',
    birthday: new Date('1999-04-22'),
    loyaltyTier: 0,
    inkCredits: 0,
  },
  {
    email: 'filip.dvorak@test.sk',
    fullName: 'Filip Dvořák',
    phone: '+421 908 888 008',
    birthday: new Date('1991-09-14'),
    loyaltyTier: 4,
    inkCredits: 100,
  },
];

const inviteeProfiles: SeedCustomer[] = [
  {
    email: 'sarah.weber@test.sk',
    fullName: 'Sarah Weber',
    phone: '+421 910 100 100',
    birthday: new Date('1997-02-11'),
    loyaltyTier: 1,
    inkCredits: 0,
    invitedByEmail: 'martina.kovacova@test.sk',
  },
  {
    email: 'michal.balog@test.sk',
    fullName: 'Michal Balog',
    phone: '+421 910 100 101',
    birthday: new Date('1994-07-03'),
    loyaltyTier: 0,
    inkCredits: 0,
    invitedByEmail: 'martina.kovacova@test.sk',
  },
  {
    email: 'eva.kralova@test.sk',
    fullName: 'Eva Kráľová',
    phone: '+421 910 100 102',
    birthday: new Date('2000-10-28'),
    loyaltyTier: 2,
    inkCredits: 0,
    invitedByEmail: 'peter.novak@test.sk',
  },
  {
    email: 'david.cerny@test.sk',
    fullName: 'David Černý',
    phone: '+421 910 100 103',
    birthday: new Date('1992-05-17'),
    loyaltyTier: 0,
    inkCredits: 0,
    invitedByEmail: 'peter.novak@test.sk',
  },
  {
    email: 'klara.svobodova@test.sk',
    fullName: 'Klára Svobodová',
    phone: '+421 910 100 104',
    birthday: new Date('1998-12-01'),
    loyaltyTier: 1,
    inkCredits: 0,
    invitedByEmail: 'lucia.benesova@test.sk',
  },
];

async function upsertCustomer(
  profile: SeedCustomer,
  hashedPassword: string,
  invitedById?: string
) {
  return prisma.customer.upsert({
    where: { email: profile.email },
    update: {
      fullName: profile.fullName,
      phone: profile.phone,
      birthday: profile.birthday,
      loyaltyTier: profile.loyaltyTier,
      loyaltyCardEnabled: profile.loyaltyTier > 0,
      inkCredits: profile.inkCredits,
      isVip: profile.isVip ?? false,
      loyaltyVipFromCard: profile.loyaltyVipFromCard ?? false,
      vipAwardedAt: profile.isVip ? new Date('2026-08-01') : null,
      emailVerified: true,
      isActive: true,
      invitedById: invitedById ?? null,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
    create: {
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      password: hashedPassword,
      birthday: profile.birthday,
      loyaltyTier: profile.loyaltyTier,
      loyaltyCardEnabled: profile.loyaltyTier > 0,
      inkCredits: profile.inkCredits,
      isVip: profile.isVip ?? false,
      loyaltyVipFromCard: profile.loyaltyVipFromCard ?? false,
      vipAwardedAt: profile.isVip ? new Date('2026-08-01') : null,
      confirmAdult: true,
      agreeDataProcessing: true,
      agreeMarketing: true,
      emailVerified: true,
      isActive: true,
      invitedById: invitedById ?? null,
    },
  });
}

async function seedLoyaltyTransaction(
  customerId: string,
  amountSpent: number,
  tiersBefore: number,
  tiersAfter: number,
  tiersUnlocked: number[],
  redundantAmount: number,
  notes: string,
  createdAt: Date
) {
  await prisma.loyaltyTransaction.create({
    data: {
      customerId,
      amountSpent,
      tiersBefore,
      tiersAfter,
      tiersUnlocked: JSON.stringify(tiersUnlocked),
      redundantAmount,
      notes,
      createdAt,
    },
  });
}

async function seedInviteeActivation(
  inviteeId: string,
  inviterId: string,
  amountSpent: number,
  notes: string,
  createdAt: Date
) {
  await prisma.inviteeActivation.create({
    data: {
      inviteeId,
      inviterId,
      amountSpent,
      inkCreditsAwarded: 100,
      notes,
      createdAt,
    },
  });
}

async function main() {
  console.log('🌱 Seeding customer program test data...\n');

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
  const emailMap = new Map<string, string>();

  const existing = await prisma.customer.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (existing) {
    const boosted = await prisma.customer.update({
      where: { id: existing.id },
      data: {
        loyaltyTier: 3,
        loyaltyCardEnabled: true,
        inkCredits: 200,
        emailVerified: true,
        isActive: true,
        birthday: existing.birthday ?? new Date('1998-05-15'),
        adminNotes: 'Hlavný testovací účet — pozývateľ v letnom programe',
      },
    });
    emailMap.set(boosted.email.toLowerCase(), boosted.id);
    console.log(`✅ Updated your account: ${boosted.fullName} (${boosted.email})`);
    console.log(`   → loyalty tier 3, 200 ink credits\n`);
  }

  for (const profile of seedCustomers) {
    const customer = await upsertCustomer(profile, hashedPassword);
    emailMap.set(profile.email, customer.id);
    console.log(`✅ Customer: ${profile.fullName} — tier ${profile.loyaltyTier}, ${profile.inkCredits} ink`);
  }

  for (const profile of inviteeProfiles) {
    const inviterId = profile.invitedByEmail
      ? emailMap.get(profile.invitedByEmail)
      : undefined;

    if (!inviterId) {
      console.warn(`⚠️  Skipping ${profile.email} — inviter not found`);
      continue;
    }

    const customer = await upsertCustomer(profile, hashedPassword, inviterId);
    emailMap.set(profile.email, customer.id);
    console.log(`✅ Invitee: ${profile.fullName} — invited by ${profile.invitedByEmail}`);
  }

  const mainId = existing ? emailMap.get(existing.email.toLowerCase())! : null;

  if (mainId) {
    const mainInvitees = inviteeProfiles.slice(0, 2);
    for (const inv of mainInvitees) {
      const invId = emailMap.get(inv.email);
      if (!invId) continue;
      await prisma.customer.update({
        where: { id: invId },
        data: { invitedById: mainId },
      });
    }

    const sarahId = emailMap.get('sarah.weber@test.sk');
    const michalId = emailMap.get('michal.balog@test.sk');
    if (sarahId) {
      await seedInviteeActivation(sarahId, mainId, 85, 'Tetovanie na predlaktí', SUMMER_START);
    }
    if (michalId) {
      await seedInviteeActivation(michalId, mainId, 120, 'Tetovanie na lýtko', SUMMER_MID);
    }
    await prisma.customer.update({
      where: { id: mainId },
      data: { inkCredits: 200 },
    });
    console.log('\n✅ Summer activations for your account (+200 ink from 2 invitees)');
  }

  const martinaId = emailMap.get('martina.kovacova@test.sk');
  const peterId = emailMap.get('peter.novak@test.sk');
  const luciaId = emailMap.get('lucia.benesova@test.sk');

  if (martinaId) {
    const sarahId = emailMap.get('sarah.weber@test.sk');
    const michalId = emailMap.get('michal.balog@test.sk');
    if (sarahId) await seedInviteeActivation(sarahId, martinaId, 95, 'Mini tattoo', SUMMER_START);
    if (michalId) await seedInviteeActivation(michalId, martinaId, 70, 'Korekcia', SUMMER_LATE);
    await prisma.customer.update({ where: { id: martinaId }, data: { inkCredits: 400 } });
  }

  if (peterId) {
    const evaId = emailMap.get('eva.kralova@test.sk');
    if (evaId) await seedInviteeActivation(evaId, peterId, 110, 'Tetovanie na rameno', SUMMER_MID);
    await prisma.customer.update({ where: { id: peterId }, data: { inkCredits: 300 } });
  }

  if (luciaId) {
    const klaraId = emailMap.get('klara.svobodova@test.sk');
    if (klaraId) await seedInviteeActivation(klaraId, luciaId, 60, 'Prvé tetovanie', SUMMER_LATE);
    await prisma.customer.update({ where: { id: luciaId }, data: { inkCredits: 250 } });
  }

  console.log('✅ Summer leaderboard activations seeded');

  const loyaltySeeds = [
    { email: 'martina.kovacova@test.sk', amount: 260, before: 0, after: 5, unlocked: [1, 2, 3, 4, 5], redundant: 10, notes: 'Veľké tetovanie na chrbát' },
    { email: 'peter.novak@test.sk', amount: 110, before: 0, after: 2, unlocked: [1, 2], redundant: 10, notes: 'Dve malé tetovania naraz' },
    { email: 'zuzana.horvathova@test.sk', amount: 350, before: 0, after: 5, unlocked: [1, 2, 3, 4, 5], redundant: 100, notes: 'Sleeve session 1' },
    { email: 'zuzana.horvathova@test.sk', amount: 220, before: 5, after: 7, unlocked: [6, 7], redundant: 20, notes: 'Sleeve session 2' },
    { email: 'jakub.mraz@test.sk', amount: 550, before: 0, after: 8, unlocked: [1, 2, 3, 4, 5, 6, 7, 8], redundant: 0, notes: 'Celý chrbát — maratón' },
    { email: 'jakub.mraz@test.sk', amount: 200, before: 8, after: 10, unlocked: [9, 10], redundant: 0, notes: 'VIP finále' },
    { email: 'lucia.benesova@test.sk', amount: 160, before: 0, after: 3, unlocked: [1, 2, 3], redundant: 10, notes: 'Tri malé motívy' },
    { email: 'tomas.varga@test.sk', amount: 60, before: 0, after: 1, unlocked: [1], redundant: 10, notes: 'Prvé tetovanie' },
    { email: 'filip.dvorak@test.sk', amount: 210, before: 0, after: 4, unlocked: [1, 2, 3, 4], redundant: 10, notes: 'Polovička ruky' },
  ];

  for (const tx of loyaltySeeds) {
    const customerId = emailMap.get(tx.email);
    if (!customerId) continue;
    await seedLoyaltyTransaction(
      customerId,
      tx.amount,
      tx.before,
      tx.after,
      tx.unlocked,
      tx.redundant,
      tx.notes,
      SUMMER_MID
    );
  }

  if (mainId) {
    await seedLoyaltyTransaction(mainId, 160, 0, 3, [1, 2, 3], 10, 'Testovacia návšteva', SUMMER_START);
    await prisma.customer.update({ where: { id: mainId }, data: { loyaltyTier: 3, loyaltyCardEnabled: true } });
  }

  console.log('✅ Loyalty card transactions seeded');

  const total = await prisma.customer.count();
  const activations = await prisma.inviteeActivation.count();
  const loyaltyTx = await prisma.loyaltyTransaction.count();

  console.log('\n📊 Summary:');
  console.log(`   Customers: ${total}`);
  console.log(`   Summer activations: ${activations}`);
  console.log(`   Loyalty transactions: ${loyaltyTx}`);
  console.log(`\n🔑 Test accounts password: ${TEST_PASSWORD}`);
  console.log('   (your existing account keeps its original password)\n');
  console.log('🏆 Leaderboard top 3 (ink credits):');
  const top = await prisma.customer.findMany({
    orderBy: { inkCredits: 'desc' },
    take: 3,
    select: { fullName: true, inkCredits: true, loyaltyTier: true, isVip: true },
  });
  top.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.fullName} — ${c.inkCredits} ink, tier ${c.loyaltyTier}${c.isVip ? ' (VIP)' : ''}`);
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
