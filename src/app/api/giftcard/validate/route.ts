import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Kód a email sú povinné' },
        { status: 400 }
      );
    }

    // Find the gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        uses: {
          where: { customerEmail: email }
        }
      }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Neplatný darčekový poukaz' },
        { status: 404 }
      );
    }

    // Check if gift card is active
    if (!giftCard.isActive) {
      return NextResponse.json(
        { error: 'Darčekový poukaz nie je aktívny' },
        { status: 400 }
      );
    }

    // Check if gift card has expired
    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return NextResponse.json(
        { error: 'Darčekový poukaz vypršal' },
        { status: 400 }
      );
    }

    // Check if gift card has reached max uses
    if (giftCard.currentUses >= giftCard.maxUses) {
      return NextResponse.json(
        { error: 'Darčekový poukaz už bol použitý maximálny počet krát' },
        { status: 400 }
      );
    }

    // Check if gift card has balance
    if (giftCard.balance <= 0) {
      return NextResponse.json(
        { error: 'Darčekový poukaz nemá dostatočný zostatok' },
        { status: 400 }
      );
    }

    // Check if this customer has already used this gift card
    if (giftCard.uses.length > 0) {
      return NextResponse.json(
        { error: 'Tento darčekový poukaz ste už použili' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        description: giftCard.description,
        remainingUses: giftCard.maxUses - giftCard.currentUses
      }
    });

  } catch (error) {
    console.error('Error validating gift card:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri validácii darčekového poukazu' },
      { status: 500 }
    );
  }
} 