import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

async function backfillInkCreditTotals() {
  const customers = await prisma.customer.findMany({
    select: { id: true, inkCredits: true, inkCreditsEarned: true, inkCreditsSpent: true },
  });

  for (const customer of customers) {
    if (customer.inkCreditsEarned === 0 && customer.inkCredits > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          inkCreditsEarned: customer.inkCredits + customer.inkCreditsSpent,
        },
      });
    }
  }
}

async function backfillInkCreditTransactionsFromActivations() {
  const activations = await prisma.inviteeActivation.findMany({
    include: { invitee: { select: { fullName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  for (const activation of activations) {
    const existing = await prisma.inkCreditTransaction.findFirst({
      where: {
        customerId: activation.inviterId,
        type: 'earned_invite',
        amount: activation.inkCreditsAwarded,
        createdAt: activation.createdAt,
      },
    });

    if (!existing) {
      await prisma.inkCreditTransaction.create({
        data: {
          customerId: activation.inviterId,
          amount: activation.inkCreditsAwarded,
          type: 'earned_invite',
          description: `Aktivácia pozvaného: ${activation.invitee.fullName}`,
          createdAt: activation.createdAt,
        },
      });
    }
  }
}

await backfillInkCreditTotals();
await backfillInkCreditTransactionsFromActivations();
console.log('Ink credit backfill complete');
await prisma.$disconnect();
