import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklyAnalyticsReport } from '@/app/lib/weeklyAnalyticsEmail';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendWeeklyAnalyticsReport();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Nepodarilo sa odoslať report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipient: result.recipient,
    });
  } catch (error) {
    console.error('Weekly analytics cron error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri generovaní reportu' },
      { status: 500 }
    );
  }
}
