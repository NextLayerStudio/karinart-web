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

    // Find the discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        uses: {
          where: { customerEmail: email }
        }
      }
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Neplatný zľavový kód' },
        { status: 404 }
      );
    }

    // Check if code is active
    if (!discountCode.isActive) {
      return NextResponse.json(
        { error: 'Zľavový kód nie je aktívny' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return NextResponse.json(
        { error: 'Zľavový kód vypršal' },
        { status: 400 }
      );
    }

    // Check if code is available from date
    if (discountCode.availableFrom && new Date() < discountCode.availableFrom) {
      return NextResponse.json(
        { error: 'Zľavový kód ešte nie je dostupný' },
        { status: 400 }
      );
    }

    // Check if code is available until date
    if (discountCode.availableTo && new Date() > discountCode.availableTo) {
      return NextResponse.json(
        { error: 'Zľavový kód už nie je dostupný' },
        { status: 400 }
      );
    }

    // Check if code has reached max uses
    if (discountCode.currentUses >= discountCode.maxUses) {
      return NextResponse.json(
        { error: 'Zľavový kód už bol použitý maximálny počet krát' },
        { status: 400 }
      );
    }

    // Check if this customer has already used this code
    if (discountCode.uses.length > 0) {
      return NextResponse.json(
        { error: 'Tento zľavový kód ste už použili' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        description: discountCode.description,
        remainingUses: discountCode.maxUses - discountCode.currentUses
      }
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri validácii zľavového kódu' },
      { status: 500 }
    );
  }
} 