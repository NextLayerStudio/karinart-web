import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the image from database
    const tattooImage = await prisma.tattooImage.findUnique({
      where: { id },
    });

    if (!tattooImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(tattooImage.imageUrl);
    } catch (blobError) {
      console.error('Blob deletion error:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.tattooImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the image' },
      { status: 500 }
    );
  }
} 