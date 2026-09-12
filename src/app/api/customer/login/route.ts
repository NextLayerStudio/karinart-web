import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer } from '@/app/lib/customerService';
import { createCustomerSession } from '@/app/lib/customerAuth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const result = await loginCustomer(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const token = await createCustomerSession(result.customerId);
    const response = NextResponse.json({
      success: true,
      isVip: result.isVip ?? false,
    });
    response.cookies.set({
      name: 'customer_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri prihlásení' },
      { status: 500 }
    );
  }
}
