import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const pathname = request.nextUrl.pathname;

  // Redirect admin.karinart.sk to karinart.sk/admin
  if (hostname === 'admin.karinart.sk') {
    return NextResponse.redirect('https://karinart.sk/admin');
  }

  // Tattoo section as the public landing page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/tattoo', request.url));
  }

  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isAdminRoot = pathname === '/admin';
  const sessionCookie = request.cookies.get('admin_session');
  const customerSessionCookie = request.cookies.get('customer_session');
  const isCustomerLoginPage = pathname === '/customer/login';
  const isCustomerProtectedPage = pathname.startsWith('/customer-program');

  // Customer program pages require login
  if (isCustomerProtectedPage && !customerSessionCookie) {
    return NextResponse.redirect(new URL('/customer/login', request.url));
  }

  // Redirect logged-in customers away from login page
  if (isCustomerLoginPage && customerSessionCookie) {
    return NextResponse.redirect(new URL('/customer-program', request.url));
  }

  // If trying to access login page with valid session, redirect to admin portfolio
  if (isLoginPage && sessionCookie) {
    return NextResponse.redirect(new URL('/admin/portfolio', request.url));
  }

  // If trying to access admin root with valid session, redirect to admin portfolio
  if (isAdminRoot && sessionCookie) {
    return NextResponse.redirect(new URL('/admin/portfolio', request.url));
  }

  // If trying to access admin pages (except login and root) without session, redirect to login
  if (isAdminPage && !isLoginPage && !isAdminRoot && !sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_static|favicon.ico).*)'],
}; 