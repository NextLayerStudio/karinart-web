import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { tattooPortfolioImages } from '@/app/lib/tattooPortfolioImages';

export async function GET() {
  try {
    const tattooImages = await prisma.tattooImage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const dbItems = tattooImages.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    }));

    if (dbItems.length === 0) {
      return NextResponse.json(tattooPortfolioImages);
    }

    return NextResponse.json(dbItems);
  } catch (error) {
    console.error('Error fetching tattoo images, using static gallery fallback:', error);
    return NextResponse.json(tattooPortfolioImages);
  }
}
