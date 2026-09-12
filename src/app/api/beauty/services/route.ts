import { NextResponse } from 'next/server';
import { getMergedBeautyBookableServices } from '@/app/lib/beautyPriceService';

export async function GET() {
  try {
    const services = await getMergedBeautyBookableServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Beauty services API error:', error);
    return NextResponse.json(
      { error: 'Nepodarilo sa načítať služby' },
      { status: 500 }
    );
  }
}
