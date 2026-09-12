import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - Fetch all discount codes
export async function GET() {
  try {
    const discountCodes = await prisma.discountCode.findMany({
      include: {
        uses: {
          orderBy: { usedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(discountCodes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní zľavových kódov' },
      { status: 500 }
    );
  }
}

// POST - Create new discount code
export async function POST(request: NextRequest) {
  try {
    const {
      code,
      type,
      value,
      maxUses,
      expiresAt,
      availableFrom,
      availableTo,
      description
    } = await request.json();

    if (!code || !type || value === undefined || !maxUses) {
      return NextResponse.json(
        { error: 'Všetky povinné polia musia byť vyplnené' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { error: 'Neplatný typ zľavy' },
        { status: 400 }
      );
    }

    // Validate value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentuálna zľava musí byť medzi 0 a 100' },
        { status: 400 }
      );
    }

    if (type === 'fixed' && value < 0) {
      return NextResponse.json(
        { error: 'Fixná zľava nemôže byť záporná' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Zľavový kód s týmto kódom už existuje' },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        description
      }
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní zľavového kódu' },
      { status: 500 }
    );
  }
} 