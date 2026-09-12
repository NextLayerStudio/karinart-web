import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

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

    const flashDesign = await prisma.flashDesign.findUnique({
      where: { id },
    });

    if (!flashDesign) {
      return NextResponse.json(
        { error: 'Flash design not found' },
        { status: 404 }
      );
    }

    await prisma.flashDesign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flash design:', error);
    return NextResponse.json(
      { error: 'Failed to delete flash design' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, price, reserved } = await request.json();

    const flashDesign = await prisma.flashDesign.findUnique({
      where: { id },
    });

    if (!flashDesign) {
      return NextResponse.json(
        { error: 'Flash design not found' },
        { status: 404 }
      );
    }

    // Validate price if provided
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return NextResponse.json(
        { error: 'Invalid price. Must be a positive number' },
        { status: 400 }
      );
    }

    const updatedDesign = await prisma.flashDesign.update({
      where: { id },
      data: {
        title: title !== undefined ? title : flashDesign.title,
        price: price !== undefined ? price : flashDesign.price,
        reserved: reserved !== undefined ? reserved : flashDesign.reserved,
      },
    });

    return NextResponse.json({
      success: true,
      design: {
        ...updatedDesign,
        createdAt: updatedDesign.createdAt.toISOString(),
        updatedAt: updatedDesign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating flash design:', error);
    return NextResponse.json(
      { error: 'Failed to update flash design' },
      { status: 500 }
    );
  }
}
