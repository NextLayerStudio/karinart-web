import prisma from '@/app/lib/prisma';

export type InkCreditTransactionType = 'earned_invite' | 'spent' | 'admin_adjust';

export async function awardInkCredits(
  customerId: string,
  amount: number,
  type: InkCreditTransactionType,
  description?: string,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const client = tx ?? prisma;

  await client.inkCreditTransaction.create({
    data: {
      customerId,
      amount,
      type,
      description: description?.trim() || null,
    },
  });

  await client.customer.update({
    where: { id: customerId },
    data: {
      inkCredits: { increment: amount },
      inkCreditsEarned: { increment: amount },
    },
  });
}

export async function spendInkCredits(
  customerId: string,
  amount: number,
  description?: string
): Promise<
  | { success: true; remaining: number }
  | { success: false; error: string; status: number }
> {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { success: false, error: 'Zadajte platný počet ink kreditov', status: 400 };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { inkCredits: true, isActive: true, emailVerified: true },
  });

  if (!customer) {
    return { success: false, error: 'Zákazník nebol nájdený', status: 404 };
  }

  if (!customer.emailVerified || !customer.isActive) {
    return {
      success: false,
      error: 'Zákazník musí mať overený a aktívny účet',
      status: 400,
    };
  }

  if (customer.inkCredits < amount) {
    return {
      success: false,
      error: `Nedostatok kreditov. Dostupných: ${customer.inkCredits} ink`,
      status: 400,
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.inkCreditTransaction.create({
      data: {
        customerId,
        amount: -amount,
        type: 'spent',
        description: description?.trim() || null,
      },
    });

    return tx.customer.update({
      where: { id: customerId },
      data: {
        inkCredits: { decrement: amount },
        inkCreditsSpent: { increment: amount },
      },
      select: { inkCredits: true },
    });
  });

  return { success: true, remaining: updated.inkCredits };
}

export async function getInkCreditStats(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      inkCredits: true,
      inkCreditsEarned: true,
      inkCreditsSpent: true,
    },
  });

  if (!customer) {
    return null;
  }

  return {
    available: customer.inkCredits,
    earned: customer.inkCreditsEarned,
    spent: customer.inkCreditsSpent,
  };
}

export async function getInkCreditHistory(customerId: string, limit = 20) {
  return prisma.inkCreditTransaction.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function backfillInkCreditTotals() {
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

export async function backfillInkCreditTransactionsFromActivations() {
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
