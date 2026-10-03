import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { isFlashSaleEnabled } from '@/app/lib/siteSettings';

export async function GET() {
  try {
    const [flashDesigns, saleEnabled] = await Promise.all([
      prisma.flashDesign.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      }),
      isFlashSaleEnabled(),
    ]);

    return NextResponse.json(
      flashDesigns.map(design => ({
        ...design,
        // Akcia platí len pre návrhy, ktoré majú vyplnenú akciovú cenu
        onSale: saleEnabled && design.salePrice !== null,
        createdAt: design.createdAt.toISOString(),
        updatedAt: design.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching flash designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flash designs' },
      { status: 500 }
    );
  }
}
