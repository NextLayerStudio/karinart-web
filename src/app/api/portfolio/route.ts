import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const tattooImages = await prisma.tattooImage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      tattooImages.map(img => ({
        ...img,
        createdAt: img.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching tattoo images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tattoo images' },
      { status: 500 }
    );
  }
} 