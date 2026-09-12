import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { setCustomerLoyaltyCardEnabled } from '@/app/lib/loyaltyService';

export async function PATCH(
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

    if (typeof body.loyaltyCardEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Zadajte loyaltyCardEnabled (true/false)' },
        { status: 400 }
      );
    }

    const result = await setCustomerLoyaltyCardEnabled(id, body.loyaltyCardEnabled);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      loyaltyCardEnabled: result.loyaltyCardEnabled,
      message: result.loyaltyCardEnabled
        ? 'Vernostná karta bola pridelená'
        : 'Vernostná karta bola odobratá',
    });
  } catch (error) {
    console.error('Loyalty card toggle error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri zmene vernostnej karty' },
      { status: 500 }
    );
  }
}
