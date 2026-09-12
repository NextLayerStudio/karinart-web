import prisma from '@/app/lib/prisma';
import { sendVipExpiryWarningEmail } from '@/app/lib/vipExpiryWarningEmail';
import { excludeTestCustomersWhere } from '@/app/lib/testAccount';

export const VIP_VALIDITY_DAYS = 365;
export const VIP_WARNING_DAYS_BEFORE = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type VipActivitySource = {
  vipLastActivityAt: Date | null;
  vipAwardedAt: Date | null;
  createdAt: Date;
};

export function getVipActivityAnchor(customer: VipActivitySource): Date {
  return customer.vipLastActivityAt ?? customer.vipAwardedAt ?? customer.createdAt;
}

export function getVipExpiresAt(anchor: Date): Date {
  return new Date(anchor.getTime() + VIP_VALIDITY_DAYS * MS_PER_DAY);
}

export function formatSkDate(date: Date): string {
  return date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getVipStatusInfo(customer: VipActivitySource & { isVip: boolean }) {
  if (!customer.isVip) {
    return {
      vipLastActivityAt: customer.vipLastActivityAt,
      vipExpiresAt: null as Date | null,
      daysUntilExpiry: null as number | null,
    };
  }

  const anchor = getVipActivityAnchor(customer);
  const vipExpiresAt = getVipExpiresAt(anchor);
  const daysUntilExpiry = Math.max(
    0,
    Math.ceil((vipExpiresAt.getTime() - Date.now()) / MS_PER_DAY)
  );

  return {
    vipLastActivityAt: customer.vipLastActivityAt ?? anchor,
    vipExpiresAt,
    daysUntilExpiry,
  };
}

export async function touchVipActivity(customerId: string): Promise<void> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      isVip: true,
      loyaltyTier: true,
      loyaltyVipFromCard: true,
    },
  });

  if (!customer) {
    return;
  }

  const shouldRestoreVip =
    !customer.isVip && customer.loyaltyVipFromCard && customer.loyaltyTier >= 10;

  if (!customer.isVip && !shouldRestoreVip) {
    return;
  }

  const now = new Date();
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      vipLastActivityAt: now,
      vipExpiryWarningSentAt: null,
      ...(shouldRestoreVip && { isVip: true }),
    },
  });
}

export type VipLifecycleResult = {
  isVip: boolean;
  vipLastActivityAt: Date | null;
  vipExpiresAt: Date | null;
  daysUntilExpiry: number | null;
  warningSent: boolean;
  expired: boolean;
};

export async function processVipLifecycleForCustomer(
  customerId: string
): Promise<VipLifecycleResult | null> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      fullName: true,
      isVip: true,
      loyaltyTier: true,
      loyaltyVipFromCard: true,
      vipLastActivityAt: true,
      vipAwardedAt: true,
      vipExpiryWarningSentAt: true,
      createdAt: true,
    },
  });

  if (!customer) {
    return null;
  }

  if (customer.isVip && !customer.vipLastActivityAt) {
    const anchor = customer.vipAwardedAt ?? customer.createdAt;
    await prisma.customer.update({
      where: { id: customerId },
      data: { vipLastActivityAt: anchor },
    });
    customer.vipLastActivityAt = anchor;
  }

  if (!customer.isVip) {
    return {
      isVip: false,
      vipLastActivityAt: customer.vipLastActivityAt,
      vipExpiresAt: null,
      daysUntilExpiry: null,
      warningSent: false,
      expired: false,
    };
  }

  const anchor = getVipActivityAnchor(customer);
  const expiresAt = getVipExpiresAt(anchor);
  const now = new Date();
  const warningStartsAt = new Date(
    expiresAt.getTime() - VIP_WARNING_DAYS_BEFORE * MS_PER_DAY
  );

  if (now >= expiresAt) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { isVip: false },
    });

    return {
      isVip: false,
      vipLastActivityAt: customer.vipLastActivityAt,
      vipExpiresAt: expiresAt,
      daysUntilExpiry: 0,
      warningSent: Boolean(customer.vipExpiryWarningSentAt),
      expired: true,
    };
  }

  let warningSent = Boolean(customer.vipExpiryWarningSentAt);

  if (now >= warningStartsAt && !customer.vipExpiryWarningSentAt) {
    const daysRemaining = Math.max(
      1,
      Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY)
    );

    const emailResult = await sendVipExpiryWarningEmail({
      to: customer.email,
      fullName: customer.fullName,
      expiresAt,
      daysRemaining,
    });

    if (emailResult.success) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { vipExpiryWarningSentAt: now },
      });
      warningSent = true;
    }
  }

  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY);

  return {
    isVip: true,
    vipLastActivityAt: customer.vipLastActivityAt ?? anchor,
    vipExpiresAt: expiresAt,
    daysUntilExpiry,
    warningSent,
    expired: false,
  };
}

export async function processAllVipLifecycles(): Promise<{
  processed: number;
  expired: number;
  warningsSent: number;
}> {
  const vips = await prisma.customer.findMany({
    where: { isVip: true, ...excludeTestCustomersWhere },
    select: { id: true },
  });

  let expired = 0;
  let warningsSent = 0;

  for (const { id } of vips) {
    const result = await processVipLifecycleForCustomer(id);
    if (!result) {
      continue;
    }
    if (result.expired) {
      expired++;
    } else if (result.warningSent) {
      warningsSent++;
    }
  }

  return { processed: vips.length, expired, warningsSent };
}

export const vipGrantActivityFields = () => ({
  vipLastActivityAt: new Date(),
  vipExpiryWarningSentAt: null,
});

export async function recordVipMaintenanceVisit(
  customerId: string,
  amountSpent: number,
  notes?: string
): Promise<
  | { success: true; message: string }
  | { success: false; error: string; status: number }
> {
  if (!Number.isFinite(amountSpent) || amountSpent <= 0) {
    return { success: false, error: 'Zadajte platnú sumu útraty', status: 400 };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      isVip: true,
      loyaltyTier: true,
      loyaltyCardEnabled: true,
      emailVerified: true,
      isActive: true,
    },
  });

  if (!customer) {
    return { success: false, error: 'Zákazník nebol nájdený', status: 404 };
  }

  if (!customer.isVip) {
    return { success: false, error: 'Zákazník nemá aktívny VIP status', status: 400 };
  }

  if (!customer.emailVerified || !customer.isActive) {
    return {
      success: false,
      error: 'Zákazník musí mať overený a aktívny účet',
      status: 400,
    };
  }

  if (customer.loyaltyCardEnabled) {
    await prisma.loyaltyTransaction.create({
      data: {
        customerId,
        amountSpent,
        tiersUnlocked: JSON.stringify([]),
        tiersBefore: customer.loyaltyTier,
        tiersAfter: customer.loyaltyTier,
        notes: notes?.trim() || 'VIP návšteva — predĺženie platnosti',
      },
    });
  }

  await touchVipActivity(customerId);

  return {
    success: true,
    message: 'VIP platnosť bola predĺžená o ďalší rok od dnešnej návštevy',
  };
}
