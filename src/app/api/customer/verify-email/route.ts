import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerEmail } from '@/app/lib/customerService';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const result = await verifyCustomerEmail(token ?? '');

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Váš email bol úspešne overený. Vitajte v zákazníckom programe Karin Art!',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri overovaní emailu' },
      { status: 500 }
    );
  }
}
