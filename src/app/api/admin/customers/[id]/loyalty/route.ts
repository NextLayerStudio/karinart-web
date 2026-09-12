import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { recordLoyaltySpending } from '@/app/lib/loyaltyService';

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

    const result = await recordLoyaltySpending(id, amountSpent, notes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { result: data } = result;
    const rewardNames = data.unlockedRewards.map((r) => r.title).join(', ');

    return NextResponse.json({
      success: true,
      message: `Odomknuté úrovne: ${data.tiersUnlocked.join(', ')} (${rewardNames})${
        data.redundantAmount > 0 ? `. Nevyužitých ${data.redundantAmount} €` : ''
      }${data.vipGranted ? '. VIP status udelený!' : ''}${
        data.emailSent ? ' Email s poukazom bol odoslaný.' : ''
      }`,
      ...data,
    });
  } catch (error) {
    console.error('Loyalty spending error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri zázname útraty' },
      { status: 500 }
    );
  }
}
