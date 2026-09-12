import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { recordInviteeActivation } from '@/app/lib/inviteProgramService';

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

    const result = await recordInviteeActivation(id, amountSpent, notes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: `Udelených ${result.activation.inkCreditsAwarded} ink kreditov pre ${result.activation.inviterName}`,
      activation: result.activation,
    });
  } catch (error) {
    console.error('Record activation error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri zázname služby' },
      { status: 500 }
    );
  }
}
