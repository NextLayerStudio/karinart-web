import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNT_EMAIL } from '../src/app/lib/testAccount.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Start123';
const TEST_FULL_NAME = 'Vasek Denis (sandbox)';
const TEST_PHONE = '+421 900 000 001';
const TEST_BIRTHDAY = new Date('1995-06-15');

async function main() {
  const email = TEST_ACCOUNT_EMAIL;
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
  const now = new Date();

  const customer = await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      phone: TEST_PHONE,
      fullName: TEST_FULL_NAME,
      password: hashedPassword,
      birthday: TEST_BIRTHDAY,
      confirmAdult: true,
      agreeDataProcessing: true,
      agreeMarketing: false,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
      isActive: true,
      isTestAccount: true,
      adminNotes: 'Sandbox test účet — nepočíta sa do limitov ani leaderboardu',
      loyaltyCardEnabled: true,
      loyaltyTier: 8,
      isVip: true,
      loyaltyVipFromCard: false,
      vipAwardedAt: now,
      vipLastActivityAt: now,
      inkCredits: 500,
      inkCreditsEarned: 500,
      inkCreditsSpent: 0,
    },
    update: {
      phone: TEST_PHONE,
      fullName: TEST_FULL_NAME,
      password: hashedPassword,
      birthday: TEST_BIRTHDAY,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
      isActive: true,
      isTestAccount: true,
      adminNotes: 'Sandbox test účet — nepočíta sa do limitov ani leaderboardu',
      loyaltyCardEnabled: true,
      loyaltyTier: 8,
      isVip: true,
      vipAwardedAt: now,
      vipLastActivityAt: now,
      inkCredits: 500,
      inkCreditsEarned: 500,
    },
  });

  console.log('✅ Sandbox test account ready');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log(`   ID:       ${customer.id}`);
  console.log(`   VIP:      ${customer.isVip ? 'áno' : 'nie'}`);
  console.log(`   Karta:    úroveň ${customer.loyaltyTier}/10`);
  console.log(`   Ink:      ${customer.inkCredits}`);
  console.log('');
  console.log('Účet je overený, nepočíta sa do limitov ani verejného leaderboardu.');
  console.log('Interné emaily na info@karinart.sk sa pri tomto účte neodosielajú.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
