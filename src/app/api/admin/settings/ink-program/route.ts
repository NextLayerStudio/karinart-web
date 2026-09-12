import { NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import { isInkProgramEnabled, setInkProgramEnabled } from '@/app/lib/siteSettings';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const enabled = await isInkProgramEnabled();
  return NextResponse.json({ enabled });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: '"enabled" musí byť true/false' }, { status: 400 });
  }

  const settings = await setInkProgramEnabled(body.enabled);
  return NextResponse.json({ enabled: settings.inkProgramEnabled });
}
