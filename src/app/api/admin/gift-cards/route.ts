import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - Fetch all gift cards
export async function GET() {
  try {
    const giftCards = await prisma.giftCard.findMany({
      include: {
        uses: {
          orderBy: { usedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(giftCards);
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní darčekových poukazov' },
      { status: 500 }
    );
  }
}

// POST - Create new gift card
export async function POST(request: NextRequest) {
  try {
    const {
      code,
      amount,
      maxUses,
      expiresAt,
      description
    } = await request.json();

    if (!code || amount === undefined || !maxUses) {
      return NextResponse.json(
        { error: 'Všetky povinné polia musia byť vyplnené' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Suma darčekového poukazu musí byť väčšia ako 0' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCode = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Darčekový poukaz s týmto kódom už existuje' },
        { status: 400 }
      );
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        code: code.toUpperCase(),
        amount,
        balance: amount, // Initial balance equals amount
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description
      }
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Error creating gift card:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní darčekového poukazu' },
      { status: 500 }
    );
  }
} 