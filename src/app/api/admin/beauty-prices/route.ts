import { NextRequest, NextResponse } from 'next/server';
import {
  getBeautyPriceOverridesForAdmin,
  updateBeautyServicePrices,
} from '@/app/lib/beautyPriceService';

export async function GET() {
  try {
    const services = await getBeautyPriceOverridesForAdmin();
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Beauty prices GET error:', error);
    return NextResponse.json(
      { error: 'Nepodarilo sa načítať ceny' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Žiadne zmeny' }, { status: 400 });
    }

    await updateBeautyServicePrices(
      updates.map((item: { serviceId: string; priceEUR: number | null; durationHours: number }) => ({
        serviceId: item.serviceId,
        priceEUR: item.priceEUR ?? null,
        durationHours: Number(item.durationHours),
      }))
    );

    const services = await getBeautyPriceOverridesForAdmin();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Beauty prices PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nepodarilo sa uložiť ceny' },
      { status: 400 }
    );
  }
}
