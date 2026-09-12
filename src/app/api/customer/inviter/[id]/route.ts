import { NextResponse } from 'next/server';
import { getInviterPreview } from '@/app/lib/customerService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inviter = await getInviterPreview(id);

    if (!inviter) {
      return NextResponse.json({ error: 'Pozývací odkaz nie je platný' }, { status: 404 });
    }

    return NextResponse.json({ inviter });
  } catch (error) {
    console.error('Inviter preview error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní pozývateľa' },
      { status: 500 }
    );
  }
}
