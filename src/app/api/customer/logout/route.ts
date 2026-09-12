import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { deleteCustomerSession } from '@/app/lib/customerAuth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('customer_session');

    if (sessionCookie) {
      try {
        const decoded = verify(sessionCookie.value, JWT_SECRET) as { sessionId: string };
        await deleteCustomerSession(decoded.sessionId);
      } catch {
        // Ignore invalid session tokens during logout
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'customer_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Customer logout error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri odhlásení' },
      { status: 500 }
    );
  }
}
