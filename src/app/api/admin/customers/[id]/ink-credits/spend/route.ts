import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { spendInkCredits } from '@/app/lib/inkCreditService';

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
    const amount = parseInt(body.amount, 10);
    const description = typeof body.description === 'string' ? body.description : undefined;

    const result = await spendInkCredits(id, amount, description);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: `Odpočítaných ${amount} ink kreditov. Zostáva: ${result.remaining}`,
      remaining: result.remaining,
    });
  } catch (error) {
    console.error('Spend ink credits error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri odpočítaní kreditov' },
      { status: 500 }
    );
  }
}
