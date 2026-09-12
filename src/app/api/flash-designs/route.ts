import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const flashDesigns = await prisma.flashDesign.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      flashDesigns.map(design => ({
        ...design,
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
