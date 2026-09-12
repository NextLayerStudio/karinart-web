import { NextRequest, NextResponse } from 'next/server';
import { storeAnalyticsEvents } from '@/app/lib/siteAnalyticsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = Array.isArray(body?.events) ? body.events : [];

    const stored = await storeAnalyticsEvents(events);

    return NextResponse.json({ ok: true, stored });
  } catch (error) {
    console.error('Analytics collect error:', error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
