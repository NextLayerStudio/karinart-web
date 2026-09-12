import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const KEEP_EMAIL = 'lirixteam@gmail.com';

const prisma = new PrismaClient();

async function main() {
  const keeper = await prisma.customer.findUnique({
    where: { email: KEEP_EMAIL },
    select: { id: true, email: true, fullName: true },
  });

  if (!keeper) {
    throw new Error(`Account not found: ${KEEP_EMAIL}`);
  }

  const allCustomers = await prisma.customer.findMany({
    select: { id: true, email: true, fullName: true },
  });

  const others = allCustomers.filter((c) => c.id !== keeper.id);
  console.log(`Keeper: ${keeper.email} (${keeper.fullName})`);
  console.log(`Removing ${others.length} other account(s)...`);

  await prisma.$transaction(async (tx) => {
    await tx.inviteeActivation.deleteMany({
      where: {
        OR: [{ inviteeId: { not: keeper.id } }, { inviterId: { not: keeper.id } }],
      },
    });

    await tx.loyaltyTransaction.deleteMany({ where: { customerId: keeper.id } });
    await tx.inkCreditTransaction.deleteMany({ where: { customerId: keeper.id } });
    await tx.customerSession.deleteMany({ where: { customerId: keeper.id } });

    if (others.length > 0) {
      await tx.customer.deleteMany({
        where: { id: { not: keeper.id } },
      });
    }

    await tx.customer.update({
      where: { id: keeper.id },
      data: {
        invitedById: null,
        adminNotes: null,
        inkCredits: 0,
        inkCreditsEarned: 0,
        inkCreditsSpent: 0,
        isVip: false,
        vipAwardedAt: null,
        vipLastActivityAt: null,
        vipExpiryWarningSentAt: null,
        loyaltyTier: 0,
        loyaltyCardEnabled: false,
        loyaltyVipFromCard: false,
      },
    });
  });

  const remaining = await prisma.customer.count();
  const keeperAfter = await prisma.customer.findUnique({
    where: { id: keeper.id },
    select: {
      email: true,
      fullName: true,
      loyaltyTier: true,
      isVip: true,
      inkCredits: true,
      inkCreditsEarned: true,
      inkCreditsSpent: true,
    },
  });

  console.log('Done.');
  console.log(`Remaining accounts: ${remaining}`);
  console.log('Your profile:', keeperAfter);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
