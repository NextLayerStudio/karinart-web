import { NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { awardSummerVipToLeader } from '@/app/lib/inviteProgramService';

export async function POST() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await awardSummerVipToLeader();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: `VIP status udelený víťazovi ${result.winner.redactedName}`,
      winner: result.winner,
    });
  } catch (error) {
    console.error('Award VIP error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri udeľovaní VIP statusu' },
      { status: 500 }
    );
  }
}
