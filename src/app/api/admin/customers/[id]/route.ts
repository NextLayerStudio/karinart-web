import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { buildCustomerJoinUrl } from '@/app/lib/customerAuth';
import { getBaseUrlFromRequest } from '@/app/lib/customerUtils';
import { getInviteeActivationHistory } from '@/app/lib/inviteProgramService';
import { getSummerProgramStatus } from '@/app/lib/summerInviteProgram';
import {
  getCustomerLoyaltyProgress,
  getLoyaltyCapacityStats,
  getLoyaltyTransactionHistory,
} from '@/app/lib/loyaltyService';
import {
  getInkCreditStats,
  getInkCreditHistory,
} from '@/app/lib/inkCreditService';
import { processVipLifecycleForCustomer, getVipStatusInfo } from '@/app/lib/vipService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await processVipLifecycleForCustomer(id);

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        emailVerified: true,
        isActive: true,
        agreeMarketing: true,
        adminNotes: true,
        inkCredits: true,
        inkCreditsEarned: true,
        inkCreditsSpent: true,
        isVip: true,
        vipAwardedAt: true,
        vipLastActivityAt: true,
        vipExpiryWarningSentAt: true,
        loyaltyTier: true,
        loyaltyCardEnabled: true,
        loyaltyVipFromCard: true,
        birthday: true,
        createdAt: true,
        invitedBy: {
          select: { id: true, fullName: true, email: true },
        },
        invitees: {
          select: {
            id: true,
            fullName: true,
            email: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Zákazník nebol nájdený' }, { status: 404 });
    }

    const baseUrl = getBaseUrlFromRequest(request);
    const joinUrl = buildCustomerJoinUrl(baseUrl, customer.id);
    const activationHistory = await getInviteeActivationHistory(id);
    const summerProgram = await getSummerProgramStatus();
    const loyaltyProgress = await getCustomerLoyaltyProgress(id);
    const loyalty = loyaltyProgress
      ? { ...loyaltyProgress, ...(await getLoyaltyCapacityStats()) }
      : null;
    const loyaltyHistory = await getLoyaltyTransactionHistory(id);
    const inkCredits = await getInkCreditStats(id);
    const inkCreditHistory = await getInkCreditHistory(id);
    const vipStatus = getVipStatusInfo(customer);

    return NextResponse.json({
      customer: {
        ...customer,
        vipExpiresAt: vipStatus.vipExpiresAt,
        daysUntilVipExpiry: vipStatus.daysUntilExpiry,
      },
      joinUrl,
      activationHistory,
      summerProgram,
      loyalty,
      loyaltyHistory,
      inkCredits,
      inkCreditHistory,
    });
  } catch (error) {
    console.error('Admin customer fetch error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní zákazníka' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive, adminNotes } = body;

    const updateData: { isActive?: boolean; adminNotes?: string | null } = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (typeof adminNotes === 'string') {
      updateData.adminNotes = adminNotes.trim() || null;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        isTestAccount: true,
        adminNotes: true,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Admin customer update error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri ukladaní zákazníka' },
      { status: 500 }
    );
  }
}
