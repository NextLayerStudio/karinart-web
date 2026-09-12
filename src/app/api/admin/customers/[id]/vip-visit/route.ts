import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { recordVipMaintenanceVisit } from '@/app/lib/vipService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const amountSpent = Number(body.amountSpent);
    const notes = typeof body.notes === 'string' ? body.notes : undefined;

    const result = await recordVipMaintenanceVisit(id, amountSpent, notes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('VIP visit error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri zázname VIP návštevy' },
      { status: 500 }
    );
  }
}
