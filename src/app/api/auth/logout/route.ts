import { NextResponse } from 'next/server';
import { getAdminUser, deleteSession } from '@/app/lib/auth';

export async function POST() {
  try {
    const user = await getAdminUser();
    
    if (user) {
      // Get the session ID from the cookie
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('admin_session');
      
      if (sessionCookie) {
        const { verify } = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        
        try {
          const decoded = verify(sessionCookie.value, JWT_SECRET) as { sessionId: string };
          await deleteSession(decoded.sessionId);
        } catch (error) {
          console.error('Error decoding token during logout:', error);
        }
      }
    }

    // Clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'admin_session',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true }); // Always return success
  }
} 