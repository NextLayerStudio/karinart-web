import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const freeDesigns = await prisma.freeDesign.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      freeDesigns.map(design => ({
        ...design,
        createdAt: design.createdAt.toISOString(),
        updatedAt: design.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching free designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch free designs' },
      { status: 500 }
    );
  }
}





