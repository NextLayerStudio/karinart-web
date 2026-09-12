import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// PUT - Update gift card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      code,
      amount,
      balance,
      maxUses,
      expiresAt,
      description,
      isActive
    } = await request.json();

    const giftCard = await prisma.giftCard.update({
      where: { id },
      data: {
        code: code?.toUpperCase(),
        amount,
        balance,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description,
        isActive
      }
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Error updating gift card:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii darčekového poukazu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gift card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.giftCard.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gift card:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri mazaní darčekového poukazu' },
      { status: 500 }
    );
  }
} 