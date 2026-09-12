import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const INVITER_EMAIL = 'lirixteam@gmail.com';
const TEST_PASSWORD = 'Test1234!';
const INK_PER_ACTIVATION = 100;

const invitees = [
  {
    email: 'anna.novotna@test.sk',
    fullName: 'Anna Novotná',
    phone: '+421 911 200 001',
    birthday: new Date('1996-03-15'),
  },
  {
    email: 'marek.horak@test.sk',
    fullName: 'Marek Horák',
    phone: '+421 911 200 002',
    birthday: new Date('1994-08-22'),
  },
  {
    email: 'sofia.kralova@test.sk',
    fullName: 'Sofia Kráľová',
    phone: '+421 911 200 003',
    birthday: new Date('1999-11-08'),
  },
  {
    email: 'ondrej.benes@test.sk',
    fullName: 'Ondrej Beneš',
    phone: '+421 911 200 004',
    birthday: new Date('1992-01-30'),
  },
  {
    email: 'petra.svoboda@test.sk',
    fullName: 'Petra Svobodová',
    phone: '+421 911 200 005',
    birthday: new Date('1998-06-12'),
  },
];

const activationDates = [
  new Date('2026-07-05T11:00:00.000Z'),
  new Date('2026-07-18T14:30:00.000Z'),
  new Date('2026-08-02T10:15:00.000Z'),
];

const prisma = new PrismaClient();

async function main() {
  const inviter = await prisma.customer.findUnique({
    where: { email: INVITER_EMAIL },
    select: { id: true, email: true, fullName: true },
  });

  if (!inviter) {
    throw new Error(`Inviter not found: ${INVITER_EMAIL}`);
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
  const inviteeIds: string[] = [];

  console.log(`Inviter: ${inviter.fullName} (${inviter.email})\n`);

  for (const profile of invitees) {
    const customer = await prisma.customer.upsert({
      where: { email: profile.email },
      update: {
        fullName: profile.fullName,
        phone: profile.phone,
        birthday: profile.birthday,
        invitedById: inviter.id,
        emailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
      create: {
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        password: hashedPassword,
        birthday: profile.birthday,
        confirmAdult: true,
        agreeDataProcessing: true,
        agreeMarketing: false,
        emailVerified: true,
        isActive: true,
        invitedById: inviter.id,
      },
    });

    inviteeIds.push(customer.id);
    console.log(`✅ Invitee: ${customer.fullName}`);
  }

  const existingActivations = await prisma.inviteeActivation.count({
    where: { inviterId: inviter.id },
  });

  if (existingActivations > 0) {
    console.log(`\n⚠️  Inviter already has ${existingActivations} activation(s) — skipping new activations`);
  } else {
    console.log('\nActivating first 3 invitees...');

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < 3; i++) {
        const invitee = invitees[i];
        const inviteeId = inviteeIds[i];
        const amountSpent = 75 + i * 15;
        const createdAt = activationDates[i];

        await tx.inviteeActivation.create({
          data: {
            inviteeId,
            inviterId: inviter.id,
            amountSpent,
            inkCreditsAwarded: INK_PER_ACTIVATION,
            notes: `Seed aktivácia — ${invitee.fullName}`,
            createdAt,
          },
        });

        await tx.inkCreditTransaction.create({
          data: {
            customerId: inviter.id,
            amount: INK_PER_ACTIVATION,
            type: 'earned_invite',
            description: `Aktivácia pozvaného: ${invitee.fullName}`,
            createdAt,
          },
        });

        console.log(`   +100 ink — ${invitee.fullName} (${amountSpent} €)`);
      }

      await tx.customer.update({
        where: { id: inviter.id },
        data: {
          inkCredits: { increment: INK_PER_ACTIVATION * 3 },
          inkCreditsEarned: { increment: INK_PER_ACTIVATION * 3 },
        },
      });
    });
  }

  const summary = await prisma.customer.findUnique({
    where: { id: inviter.id },
    select: {
      fullName: true,
      inkCredits: true,
      inkCreditsEarned: true,
      _count: { select: { invitees: true } },
    },
  });

  const activationCount = await prisma.inviteeActivation.count({
    where: { inviterId: inviter.id },
  });

  console.log('\n📊 Done');
  console.log(`   Invitees: ${summary?._count.invitees}`);
  console.log(`   Activations: ${activationCount}`);
  console.log(`   Your ink credits: ${summary?.inkCredits} (earned: ${summary?.inkCreditsEarned})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
