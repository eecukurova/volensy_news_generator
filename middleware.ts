import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('volensy_session');
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isApiRoute = pathname.startsWith('/api');
  const isLoginApi = pathname === '/api/login';
  const isLogoutApi = pathname === '/api/logout';

  // Allow login and logout API routes without authentication
  if (isLoginApi || isLogoutApi) {
    return NextResponse.next();
  }

  // Allow other API routes (they can handle their own auth if needed)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  let isAuthenticated = false;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      isAuthenticated = sessionData.authenticated === true;
    } catch (error) {
      // Invalid session cookie
      isAuthenticated = false;
    }
  }

  // If user is on login page and already authenticated, redirect to news-sources
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/news-sources', request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
