import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const freeDesign = await prisma.freeDesign.findUnique({
      where: { id },
    });

    if (!freeDesign) {
      return NextResponse.json(
        { error: 'Free design not found' },
        { status: 404 }
      );
    }

    await prisma.freeDesign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting free design:', error);
    return NextResponse.json(
      { error: 'Failed to delete free design' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, reserved } = await request.json();

    const freeDesign = await prisma.freeDesign.findUnique({
      where: { id },
    });

    if (!freeDesign) {
      return NextResponse.json(
        { error: 'Free design not found' },
        { status: 404 }
      );
    }

    const updatedDesign = await prisma.freeDesign.update({
      where: { id },
      data: {
        title: title !== undefined ? title : freeDesign.title,
        description: description !== undefined ? description : freeDesign.description,
        reserved: reserved !== undefined ? reserved : freeDesign.reserved,
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
    console.error('Error updating free design:', error);
    return NextResponse.json(
      { error: 'Failed to update free design' },
      { status: 500 }
    );
  }
}



