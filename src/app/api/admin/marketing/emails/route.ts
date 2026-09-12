import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - Fetch all marketing emails
export async function GET() {
  try {
    const marketingEmails = await prisma.marketing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(marketingEmails);
  } catch (error) {
    console.error('Error fetching marketing emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing emails' },
      { status: 500 }
    );
  }
}

// DELETE - Delete selected marketing emails
export async function DELETE(request: NextRequest) {
  try {
    const { emailIds } = await request.json();

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'No email IDs provided' },
        { status: 400 }
      );
    }

    const result = await prisma.marketing.deleteMany({
      where: {
        id: {
          in: emailIds
        }
      }
    });

    return NextResponse.json({
      message: `${result.count} emails deleted successfully`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error deleting marketing emails:', error);
    return NextResponse.json(
      { error: 'Failed to delete marketing emails' },
      { status: 500 }
    );
  }
} 