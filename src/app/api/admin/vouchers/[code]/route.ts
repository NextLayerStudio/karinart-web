import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase();

    // First check discount codes
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: upperCode }
    });

    if (discountCode) {
      return NextResponse.json({
        success: true,
        type: 'discount',
        voucher: {
          id: discountCode.id,
          code: discountCode.code,
          type: discountCode.type,
          value: discountCode.value,
          description: discountCode.description,
          isActive: discountCode.isActive,
          expiresAt: discountCode.expiresAt,
          availableFrom: discountCode.availableFrom,
          availableTo: discountCode.availableTo,
          currentUses: discountCode.currentUses,
          maxUses: discountCode.maxUses,
          remainingUses: discountCode.maxUses - discountCode.currentUses
        }
      });
    }

    // If not a discount code, check gift cards
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: upperCode }
    });

    if (giftCard) {
      return NextResponse.json({
        success: true,
        type: 'giftcard',
        voucher: {
          id: giftCard.id,
          code: giftCard.code,
          amount: giftCard.amount,
          balance: giftCard.balance,
          description: giftCard.description,
          isActive: giftCard.isActive,
          expiresAt: giftCard.expiresAt,
          currentUses: giftCard.currentUses,
          maxUses: giftCard.maxUses,
          remainingUses: giftCard.maxUses - giftCard.currentUses
        }
      });
    }

    // If neither found
    return NextResponse.json(
      { error: 'Voucher nenájdený' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching voucher details:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní voucheru' },
      { status: 500 }
    );
  }
} 