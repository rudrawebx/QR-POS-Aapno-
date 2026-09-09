import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow public static assets and public customer paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/session') ||
    pathname.startsWith('/api/menu') ||
    pathname.startsWith('/api/payments') ||
    pathname.startsWith('/api/restaurants') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/order/') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get('auth_session')?.value;
  let session: any = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie);
    } catch {
      session = null;
    }
  }

  // 3. Super Admin Route Protection
  if (pathname.startsWith('/superadmin')) {
    if (!session || session.role !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Kitchen Screen Route Protection
  if (pathname.startsWith('/kitchen')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const allowedRoles = ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'KITCHEN'];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.redirect(new URL('/admin/pos', request.url));
    }
    return NextResponse.next();
  }

  // 5. Restaurant Admin Routes Protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.role;

    // Cashier allowed paths
    if (role === 'CASHIER') {
      const cashierAllowed = ['/admin/pos', '/admin/orders', '/admin/invoices', '/admin/customers', '/admin/settings'];
      if (!cashierAllowed.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.redirect(new URL('/admin/pos', request.url));
      }
    }

    // Kitchen restrictions
    if (role === 'KITCHEN') {
      return NextResponse.redirect(new URL('/kitchen', request.url));
    }

    // Staff restrictions (Owner, Manager, Super Admin)
    if (pathname.startsWith('/admin/staff')) {
      if (role !== 'SUPER_ADMIN' && role !== 'OWNER' && role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/admin/orders', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
