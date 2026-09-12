import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const giftCards = await prisma.giftCard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        uses: true,
      },
    });

    return NextResponse.json({
      success: true,
      giftCards: giftCards.map(card => ({
        ...card,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
        expiresAt: card.expiresAt?.toISOString(),
      })),
    });

  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní darčekových poukážok' },
      { status: 500 }
    );
  }
}
