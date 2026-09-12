import prisma from '@/app/lib/prisma';
import {
  getSummerProgramStatus,
  INK_CREDITS_PER_ACTIVATION,
  inkCreditsToEuros,
  isSummerProgramActive,
  redactCustomerName,
} from '@/app/lib/summerInviteProgram';
import { MAX_TOTAL_VIP } from '@/app/lib/loyaltyProgram';
import { awardInkCredits } from '@/app/lib/inkCreditService';
import { sendInviteActivationEmail } from '@/app/lib/inviteActivationEmail';
import { touchVipActivity, vipGrantActivityFields } from '@/app/lib/vipService';
import { getTestCustomerIds } from '@/app/lib/testAccount';

export async function recordInviteeActivation(
  inviteeId: string,
  amountSpent: number,
  notes?: string
): Promise<
  | {
      success: true;
      activation: {
        id: string;
        amountSpent: number;
        inkCreditsAwarded: number;
        inviterName: string;
      };
    }
  | { success: false; error: string; status: number }
> {
  if (!(await isSummerProgramActive())) {
    return {
      success: false,
      error: 'Ink program momentálne nie je aktívny',
      status: 400,
    };
  }

  if (!Number.isFinite(amountSpent) || amountSpent <= 0) {
    return {
      success: false,
      error: 'Zadajte platnú sumu útraty',
      status: 400,
    };
  }

  const invitee = await prisma.customer.findUnique({
    where: { id: inviteeId },
    select: {
      id: true,
      fullName: true,
      emailVerified: true,
      isActive: true,
      isTestAccount: true,
      invitedById: true,
      invitedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          isTestAccount: true,
        },
      },
    },
  });

  if (!invitee) {
    return { success: false, error: 'Zákazník nebol nájdený', status: 404 };
  }

  if (invitee.isTestAccount && invitee.invitedBy && !invitee.invitedBy.isTestAccount) {
    return {
      success: false,
      error: 'Sandbox test host nemôže byť aktivovaný pod reálnym pozývateľom',
      status: 400,
    };
  }

  if (!invitee.emailVerified || !invitee.isActive) {
    return {
      success: false,
      error: 'Zákazník musí mať overený a aktívny účet',
      status: 400,
    };
  }

  if (!invitee.invitedById || !invitee.invitedBy) {
    return {
      success: false,
      error: 'Tento zákazník nemá pozývateľa — ink kredity sa neudelia',
      status: 400,
    };
  }

  if (!invitee.invitedBy.isActive) {
    return {
      success: false,
      error: 'Účet pozývateľa nie je aktívny',
      status: 400,
    };
  }

  const existingActivation = await prisma.inviteeActivation.findUnique({
    where: { inviteeId },
    select: { id: true },
  });

  if (existingActivation) {
    return {
      success: false,
      error: 'Tento host už bol aktivovaný — ink kredity za neho boli už udelené',
      status: 400,
    };
  }

  const activation = await prisma.$transaction(async (tx) => {
    const created = await tx.inviteeActivation.create({
      data: {
        inviteeId: invitee.id,
        inviterId: invitee.invitedById!,
        amountSpent,
        inkCreditsAwarded: INK_CREDITS_PER_ACTIVATION,
        notes: notes?.trim() || null,
      },
    });

    await awardInkCredits(
      invitee.invitedById!,
      INK_CREDITS_PER_ACTIVATION,
      'earned_invite',
      `Aktivácia pozvaného: ${invitee.fullName}`,
      tx
    );

    return created;
  });

  try {
    const emailResult = await sendInviteActivationEmail({
      to: invitee.invitedBy.email,
      fullName: invitee.invitedBy.fullName,
      inkCreditsAwarded: activation.inkCreditsAwarded,
    });
    if (!emailResult.success) {
      console.error('Invite activation email failed:', emailResult.error);
    }
  } catch (emailError) {
    console.error('Invite activation email error:', emailError);
  }

  await touchVipActivity(inviteeId);

  return {
    success: true,
    activation: {
      id: activation.id,
      amountSpent: activation.amountSpent,
      inkCreditsAwarded: activation.inkCreditsAwarded,
      inviterName: invitee.invitedBy.fullName,
    },
  };
}

export async function getSummerLeaderboard(limit = 20) {
  const programStatus = await getSummerProgramStatus();
  const testCustomerIds = await getTestCustomerIds(prisma);

  const grouped = await prisma.inviteeActivation.groupBy({
    by: ['inviterId'],
    _sum: { inkCreditsAwarded: true },
    _count: { id: true },
    orderBy: { _sum: { inkCreditsAwarded: 'desc' } },
    take: limit * 3,
  });

  const filtered = grouped
    .filter((row) => !testCustomerIds.has(row.inviterId))
    .slice(0, limit);

  if (filtered.length === 0) {
    return { programStatus, entries: [] };
  }

  const inviterIds = filtered.map((row) => row.inviterId);
  const inviters = await prisma.customer.findMany({
    where: { id: { in: inviterIds } },
    select: { id: true, fullName: true, isVip: true, isTestAccount: true },
  });

  const inviterMap = new Map(inviters.map((inviter) => [inviter.id, inviter]));

  const entries = filtered.map((row, index) => {
    const inviter = inviterMap.get(row.inviterId);
    const inkCredits = row._sum.inkCreditsAwarded ?? 0;

    return {
      rank: index + 1,
      redactedName: redactCustomerName(inviter?.fullName ?? 'Neznámy'),
      inkCredits,
      discountValueEuros: inkCreditsToEuros(inkCredits),
      activationCount: row._count.id,
      isVip: inviter?.isVip ?? false,
    };
  });

  return { programStatus, entries };
}

export async function getCustomerSummerStats(customerId: string) {
  const programStatus = await getSummerProgramStatus();

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      inkCredits: true,
      inkCreditsEarned: true,
      inkCreditsSpent: true,
      isVip: true,
      vipAwardedAt: true,
      isTestAccount: true,
    },
  });

  if (!customer) {
    return null;
  }

  const [earnedInProgram, activations, rankData] = await Promise.all([
    prisma.inviteeActivation.aggregate({
      where: { inviterId: customerId },
      _sum: { inkCreditsAwarded: true },
      _count: { id: true },
    }),
    prisma.inviteeActivation.findMany({
      where: { inviterId: customerId },
      select: {
        id: true,
        amountSpent: true,
        inkCreditsAwarded: true,
        createdAt: true,
        invitee: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    getCustomerSummerRank(customerId, customer.isTestAccount),
  ]);

  const programInkCredits = earnedInProgram._sum.inkCreditsAwarded ?? 0;

  return {
    programStatus,
    inkCredits: customer.inkCredits,
    inkCreditsEarned: customer.inkCreditsEarned,
    inkCreditsSpent: customer.inkCreditsSpent,
    programInkCredits,
    discountValueEuros: inkCreditsToEuros(customer.inkCredits),
    earnedDiscountValueEuros: inkCreditsToEuros(customer.inkCreditsEarned),
    programDiscountValueEuros: inkCreditsToEuros(programInkCredits),
    activationCount: earnedInProgram._count.id,
    rank: rankData.rank,
    isVip: customer.isVip,
    vipAwardedAt: customer.vipAwardedAt,
    recentActivations: activations.map((activation) => ({
      id: activation.id,
      amountSpent: activation.amountSpent,
      inkCreditsAwarded: activation.inkCreditsAwarded,
      createdAt: activation.createdAt,
      inviteeName: redactCustomerName(activation.invitee.fullName),
    })),
  };
}

async function getCustomerSummerRank(customerId: string, isTestAccount = false) {
  if (isTestAccount) {
    return { rank: null, totalParticipants: 0 };
  }

  const testCustomerIds = await getTestCustomerIds(prisma);
  const grouped = await prisma.inviteeActivation.groupBy({
    by: ['inviterId'],
    _sum: { inkCreditsAwarded: true },
    orderBy: { _sum: { inkCreditsAwarded: 'desc' } },
  });

  const filtered = grouped.filter((row) => !testCustomerIds.has(row.inviterId));
  const index = filtered.findIndex((row) => row.inviterId === customerId);

  return {
    rank: index === -1 ? null : index + 1,
    totalParticipants: filtered.length,
  };
}

export async function awardSummerVipToLeader(): Promise<
  | { success: true; winner: { redactedName: string; inkCredits: number } }
  | { success: false; error: string; status: number }
> {
  const { entries } = await getSummerLeaderboard(1);

  if (entries.length === 0) {
    return {
      success: false,
      error: 'Žiadny účastník na leaderboarde',
      status: 400,
    };
  }

  const leader = entries[0];

  const topInviter = await prisma.inviteeActivation.groupBy({
    by: ['inviterId'],
    _sum: { inkCreditsAwarded: true },
    orderBy: { _sum: { inkCreditsAwarded: 'desc' } },
    take: 1,
  });

  if (topInviter.length === 0) {
    return {
      success: false,
      error: 'Žiadny účastník na leaderboarde',
      status: 400,
    };
  }

  const winnerId = topInviter[0].inviterId;

  const winner = await prisma.customer.findUnique({
    where: { id: winnerId },
    select: { isVip: true },
  });

  if (winner?.isVip) {
    return {
      success: false,
      error: 'Líder leaderboardu už má VIP status',
      status: 400,
    };
  }

  const totalVip = await prisma.customer.count({
    where: { isVip: true, isTestAccount: false },
  });
  if (totalVip >= MAX_TOTAL_VIP) {
    return {
      success: false,
      error: `Celkový limit VIP členov je obsadený (${MAX_TOTAL_VIP}/${MAX_TOTAL_VIP})`,
      status: 400,
    };
  }

  await prisma.customer.update({
    where: { id: winnerId },
    data: {
      isVip: true,
      vipAwardedAt: new Date(),
      ...vipGrantActivityFields(),
    },
  });

  return {
    success: true,
    winner: {
      redactedName: leader.redactedName,
      inkCredits: leader.inkCredits,
    },
  };
}

export async function getInviteeActivationHistory(inviteeId: string) {
  return prisma.inviteeActivation.findMany({
    where: { inviteeId },
    select: {
      id: true,
      amountSpent: true,
      inkCreditsAwarded: true,
      notes: true,
      createdAt: true,
      inviter: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
