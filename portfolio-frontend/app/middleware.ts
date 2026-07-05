// frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ⭐ DETECT DESKTOP APP
function isDesktopApp(userAgent: string): boolean {
  return userAgent.includes('HABCreativeDesktop');
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Admin routes
  if (pathname.startsWith('/admin')) {
    // Desktop app detection
    if (isDesktopApp(userAgent)) {
      // For desktop app, check session via cookie
      const token = request.cookies.get('auth_token')?.value;
      
      if (!token) {
        // Don't redirect, let desktop handle via IPC
        return NextResponse.next();
      }
    }

    // Web browser - normal flow
    if (pathname === '/admin/login' || pathname === '/auth-denied') {
      return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('status', 'unauthorized');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
