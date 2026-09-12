import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { id, isActive, balance, maxUses } = await request.json();

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'Chýba ID darčekovej poukážky' },
        { status: 400 }
      );
    }

    // Update the gift card
    const updatedGiftCard = await prisma.giftCard.update({
      where: {
        id,
      },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        balance: balance !== undefined ? balance : undefined,
        maxUses: maxUses !== undefined ? maxUses : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      giftCard: {
        ...updatedGiftCard,
        createdAt: updatedGiftCard.createdAt.toISOString(),
        updatedAt: updatedGiftCard.updatedAt.toISOString(),
        expiresAt: updatedGiftCard.expiresAt?.toISOString(),
      },
      message: 'Darčeková poukážka bola úspešne aktualizovaná',
    });

  } catch (error) {
    console.error('Error updating gift card:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii darčekovej poukážky' },
      { status: 500 }
    );
  }
}