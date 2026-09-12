import { NextResponse } from 'next/server';
import { getCustomerUser, buildCustomerJoinUrl } from '@/app/lib/customerAuth';
import { getCustomerProgramData } from '@/app/lib/customerService';
import { getCustomerSummerStats } from '@/app/lib/inviteProgramService';
import { getCustomerLoyaltyProgress } from '@/app/lib/loyaltyService';
import { getBaseUrlFromRequest } from '@/app/lib/customerUtils';
import { processVipLifecycleForCustomer } from '@/app/lib/vipService';

export async function GET(request: Request) {
  try {
    const user = await getCustomerUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await processVipLifecycleForCustomer(user.customerId);

    const customer = await getCustomerProgramData(user.customerId);
    const summerStats = await getCustomerSummerStats(user.customerId);
    const loyalty = await getCustomerLoyaltyProgress(user.customerId);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const baseUrl = getBaseUrlFromRequest(request);
    const joinUrl = buildCustomerJoinUrl(baseUrl, customer.id);

    return NextResponse.json({
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        invitedBy: customer.invitedBy,
        invitees: customer.invitees,
        inkCredits: summerStats?.inkCredits ?? 0,
        inkCreditsEarned: summerStats?.inkCreditsEarned ?? 0,
        inkCreditsSpent: summerStats?.inkCreditsSpent ?? 0,
        isVip: customer.isVip,
        vipAwardedAt: customer.vipAwardedAt,
        vipLastActivityAt: customer.vipLastActivityAt,
        vipExpiresAt: customer.vipExpiresAt,
        daysUntilVipExpiry: customer.daysUntilVipExpiry,
        isTestAccount: customer.isTestAccount,
        loyaltyVipFromCard: customer.loyaltyVipFromCard,
        birthday: customer.birthday,
        loyaltyTier: loyalty?.loyaltyTier ?? 0,
        hasBirthday: loyalty?.hasBirthday ?? false,
      },
      joinUrl,
      summerProgram: summerStats,
      loyalty,
    });
  } catch (error) {
    console.error('Customer profile error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní profilu' },
      { status: 500 }
    );
  }
}
