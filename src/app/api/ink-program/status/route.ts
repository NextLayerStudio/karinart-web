import { NextResponse } from 'next/server';
import { isInkProgramEnabled } from '@/app/lib/siteSettings';

export async function GET() {
  const enabled = await isInkProgramEnabled();
  return NextResponse.json({ enabled });
}
