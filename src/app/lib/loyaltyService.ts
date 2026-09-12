import prisma from '@/app/lib/prisma';
import {
  LOYALTY_REWARDS,
  MAX_LOYALTY_CARD_HOLDERS,
  MAX_LOYALTY_VIP_SLOTS,
  MAX_TOTAL_VIP,
  simulateTierUnlocks,
  getNextTierInfo,
  VIP_BENEFITS,
} from '@/app/lib/loyaltyProgram';
import {
  buildLoyaltyVoucherCode,
  sendLoyaltyUnlockEmail,
} from '@/app/lib/loyaltyEmail';
import { touchVipActivity, vipGrantActivityFields } from '@/app/lib/vipService';

export async function getLoyaltyCardHoldersCount(): Promise<number> {
  return prisma.customer.count({
    where: { loyaltyCardEnabled: true, isTestAccount: false },
  });
}

export async function getLoyaltyVipSlotsUsed(): Promise<number> {
  return prisma.customer.count({
    where: { loyaltyVipFromCard: true, isTestAccount: false },
  });
}

export async function getTotalVipCount(): Promise<number> {
  return prisma.customer.count({
    where: { isVip: true, isTestAccount: false },
  });
}

export async function setCustomerLoyaltyCardEnabled(
  customerId: string,
  enabled: boolean
): Promise<
  | { success: true; loyaltyCardEnabled: boolean }
  | { success: false; error: string; status: number }
> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { loyaltyCardEnabled: true, isTestAccount: true },
  });

  if (!customer) {
    return { success: false, error: 'Zákazník nebol nájdený', status: 404 };
  }

  if (enabled && !customer.loyaltyCardEnabled && !customer.isTestAccount) {
    const holders = await getLoyaltyCardHoldersCount();
    if (holders >= MAX_LOYALTY_CARD_HOLDERS) {
      return {
        success: false,
        error: `Vernostnú kartu môže mať max ${MAX_LOYALTY_CARD_HOLDERS} zákazníkov`,
        status: 400,
      };
    }
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: { loyaltyCardEnabled: enabled },
    select: { loyaltyCardEnabled: true },
  });

  return { success: true, loyaltyCardEnabled: updated.loyaltyCardEnabled };
}

export async function getCustomerLoyaltyProgress(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      loyaltyTier: true,
      loyaltyCardEnabled: true,
      isVip: true,
      loyaltyVipFromCard: true,
      birthday: true,
    },
  });

  if (!customer) {
    return null;
  }

  const nextTier = getNextTierInfo(customer.loyaltyTier);

  const rewards = LOYALTY_REWARDS.map((reward) => ({
    tier: reward.tier,
    threshold: reward.threshold,
    title: reward.title,
    isVip: reward.isVip ?? false,
    unlocked: customer.loyaltyTier >= reward.tier,
    isCurrent: customer.loyaltyTier + 1 === reward.tier,
  }));

  const recentTransactions = await prisma.loyaltyTransaction.findMany({
    where: { customerId },
    select: {
      id: true,
      amountSpent: true,
      tiersUnlocked: true,
      tiersBefore: true,
      tiersAfter: true,
      redundantAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    loyaltyTier: customer.loyaltyTier,
    loyaltyCardEnabled: customer.loyaltyCardEnabled,
    isVip: customer.isVip,
    loyaltyVipFromCard: customer.loyaltyVipFromCard,
    hasBirthday: Boolean(customer.birthday),
    nextTier,
    rewards,
    vipBenefits: customer.isVip ? VIP_BENEFITS : [],
    recentTransactions: recentTransactions.map((tx) => ({
      ...tx,
      tiersUnlockedList: JSON.parse(tx.tiersUnlocked) as number[],
    })),
  };
}

export async function getLoyaltyCapacityStats() {
  const [vipSlotsUsed, cardHolders, totalVip] = await Promise.all([
    getLoyaltyVipSlotsUsed(),
    getLoyaltyCardHoldersCount(),
    getTotalVipCount(),
  ]);

  return {
    vipSlotsRemaining: Math.max(0, MAX_LOYALTY_VIP_SLOTS - vipSlotsUsed),
    vipSlotsMax: MAX_LOYALTY_VIP_SLOTS,
    loyaltyCardSlotsRemaining: Math.max(0, MAX_LOYALTY_CARD_HOLDERS - cardHolders),
    loyaltyCardSlotsMax: MAX_LOYALTY_CARD_HOLDERS,
    totalVipSlotsRemaining: Math.max(0, MAX_TOTAL_VIP - totalVip),
    totalVipSlotsMax: MAX_TOTAL_VIP,
  };
}

export async function recordLoyaltySpending(
  customerId: string,
  amountSpent: number,
  notes?: string
): Promise<
  | {
      success: true;
      result: {
        tiersUnlocked: number[];
        tiersBefore: number;
        tiersAfter: number;
        redundantAmount: number;
        unlockedRewards: { tier: number; title: string; voucherCode: string }[];
        vipGranted: boolean;
        vipSlotBlocked: boolean;
        emailSent: boolean;
      };
    }
  | { success: false; error: string; status: number }
> {
  if (!Number.isFinite(amountSpent) || amountSpent <= 0) {
    return { success: false, error: 'Zadajte platnú sumu útraty', status: 400 };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      fullName: true,
      loyaltyTier: true,
      loyaltyCardEnabled: true,
      emailVerified: true,
      isActive: true,
      isVip: true,
      loyaltyVipFromCard: true,
    },
  });

  if (!customer) {
    return { success: false, error: 'Zákazník nebol nájdený', status: 404 };
  }

  if (!customer.loyaltyCardEnabled) {
    return {
      success: false,
      error: 'Zákazník nemá pridelenú vernostnú kartu',
      status: 400,
    };
  }

  if (!customer.emailVerified || !customer.isActive) {
    return {
      success: false,
      error: 'Zákazník musí mať overený a aktívny účet',
      status: 400,
    };
  }

  if (customer.loyaltyTier >= 10) {
    return {
      success: false,
      error: 'Zákazník už má odomknutú najvyššiu úroveň vernostnej karty',
      status: 400,
    };
  }

  const [vipSlotsUsed, totalVip] = await Promise.all([
    getLoyaltyVipSlotsUsed(),
    getTotalVipCount(),
  ]);
  const vipSlotsRemaining = Math.max(0, MAX_LOYALTY_VIP_SLOTS - vipSlotsUsed);
  const totalVipSlotsRemaining = Math.max(0, MAX_TOTAL_VIP - totalVip);

  const simulation = simulateTierUnlocks(
    customer.loyaltyTier,
    amountSpent,
    vipSlotsRemaining
  );

  const wouldGrantVip = simulation.tiersUnlocked.includes(10);

  if (wouldGrantVip && totalVipSlotsRemaining <= 0) {
    return {
      success: false,
      error: `Celkový limit VIP členov je obsadený (${MAX_TOTAL_VIP}/${MAX_TOTAL_VIP})`,
      status: 400,
    };
  }

  if (simulation.tiersUnlocked.length === 0) {
    const nextTier = getNextTierInfo(customer.loyaltyTier);
    const needed = nextTier?.threshold ?? 0;

    if (simulation.vipSlotBlocked) {
      return {
        success: false,
        error: `VIP sloty cez vernostnú kartu sú obsadené (${MAX_LOYALTY_VIP_SLOTS}/${MAX_LOYALTY_VIP_SLOTS}). Suma sa nedá použiť na úroveň 10.`,
        status: 400,
      };
    }

    return {
      success: false,
      error: `Suma nestačí na odomknutie ďalšej úrovne. Potrebných je aspoň ${needed} € v jednej návšteve.`,
      status: 400,
    };
  }

  const unlockedRewards = simulation.tiersUnlocked.map((tier) => {
    const reward = LOYALTY_REWARDS.find((r) => r.tier === tier)!;
    return { tier, title: reward.title };
  });

  const vipGranted = simulation.tiersUnlocked.includes(10);

  let transactionId = '';

  await prisma.$transaction(async (tx) => {
    const loyaltyTx = await tx.loyaltyTransaction.create({
      data: {
        customerId,
        amountSpent,
        tiersUnlocked: JSON.stringify(simulation.tiersUnlocked),
        tiersBefore: customer.loyaltyTier,
        tiersAfter: simulation.newTier,
        redundantAmount: simulation.redundantAmount,
        notes: notes?.trim() || null,
      },
    });

    transactionId = loyaltyTx.id;

    await tx.customer.update({
      where: { id: customerId },
      data: {
        loyaltyTier: simulation.newTier,
        ...(vipGranted && {
          isVip: true,
          loyaltyVipFromCard: true,
          vipAwardedAt: new Date(),
          ...vipGrantActivityFields(),
        }),
      },
    });
  });

  if (customer.isVip || vipGranted) {
    await touchVipActivity(customerId);
  }

  const unlockedRewardsWithVouchers = unlockedRewards.map((reward) => ({
    ...reward,
    voucherCode: buildLoyaltyVoucherCode(reward.tier, transactionId),
  }));

  let emailSent = false;
  try {
    const emailResult = await sendLoyaltyUnlockEmail({
      to: customer.email,
      fullName: customer.fullName,
      newTier: simulation.newTier,
      unlockedRewards: unlockedRewardsWithVouchers,
      vipGranted,
    });
    emailSent = emailResult.success;
    if (!emailResult.success) {
      console.error('Loyalty reward email failed:', emailResult.error);
    }
  } catch (emailError) {
    console.error('Loyalty reward email error:', emailError);
  }

  return {
    success: true,
    result: {
      tiersUnlocked: simulation.tiersUnlocked,
      tiersBefore: customer.loyaltyTier,
      tiersAfter: simulation.newTier,
      redundantAmount: simulation.redundantAmount,
      unlockedRewards: unlockedRewardsWithVouchers,
      vipGranted,
      vipSlotBlocked: simulation.vipSlotBlocked,
      emailSent,
    },
  };
}

export async function getLoyaltyTransactionHistory(customerId: string) {
  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return transactions.map((tx) => ({
    ...tx,
    tiersUnlockedList: JSON.parse(tx.tiersUnlocked) as number[],
  }));
}
