import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, email, appointmentDate } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Kód a email sú povinné' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase();

    // First check discount codes
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: upperCode },
      include: {
        uses: {
          where: { customerEmail: email }
        }
      }
    });

    if (discountCode) {
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

      // Check availability date range
      if (appointmentDate) {
        const appointmentDateObj = new Date(appointmentDate);
        
        if (discountCode.availableFrom && appointmentDateObj < discountCode.availableFrom) {
          return NextResponse.json(
            { error: 'Zľavový kód nie je platný pre tento dátum' },
            { status: 400 }
          );
        }

        if (discountCode.availableTo && appointmentDateObj > discountCode.availableTo) {
          return NextResponse.json(
            { error: 'Zľavový kód nie je platný pre tento dátum' },
            { status: 400 }
          );
        }
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
        type: 'discount',
        voucher: {
          id: discountCode.id,
          code: discountCode.code,
          type: discountCode.type,
          value: discountCode.value,
          description: discountCode.description,
          remainingUses: discountCode.maxUses - discountCode.currentUses
        }
      });
    }

    // If not a discount code, check gift cards
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: upperCode },
      include: {
        uses: {
          where: { customerEmail: email }
        }
      }
    });

    if (giftCard) {
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
        type: 'giftcard',
        voucher: {
          id: giftCard.id,
          code: giftCard.code,
          amount: giftCard.amount,
          balance: giftCard.balance,
          description: giftCard.description,
          remainingUses: giftCard.maxUses - giftCard.currentUses
        }
      });
    }

    // If neither found
    return NextResponse.json(
      { error: 'Neplatný kód' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri validácii kódu' },
      { status: 500 }
    );
  }
} 