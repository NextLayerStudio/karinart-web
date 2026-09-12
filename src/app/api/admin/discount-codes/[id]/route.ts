import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// PUT - Update discount code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      code,
      type,
      value,
      maxUses,
      expiresAt,
      availableFrom,
      availableTo,
      description,
      isActive
    } = await request.json();

    const discountCode = await prisma.discountCode.update({
      where: { id },
      data: {
        code: code?.toUpperCase(),
        type,
        value,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        description,
        isActive
      }
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error updating discount code:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii zľavového kódu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.discountCode.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri mazaní zľavového kódu' },
      { status: 500 }
    );
  }
} 