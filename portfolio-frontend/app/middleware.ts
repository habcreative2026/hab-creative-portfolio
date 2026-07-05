// frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DOWNLOAD_URL = "https://bhtdev.work";

function isDesktopApp(userAgent: string): boolean {
  return userAgent.includes('HABCreativeDesktop');
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  const isDesktop = isDesktopApp(userAgent);

  // ⭐ LOG CHI TIẾT
  console.log(`🔍 [Middleware] Path: ${pathname}`);
  console.log(`📱 [Middleware] User-Agent: "${userAgent}"`);
  console.log(`🖥️ [Middleware] isDesktop: ${isDesktop}`);

  if (pathname.startsWith("/admin")) {
    if (pathname === "/auth-denied") {
      return NextResponse.next();
    }

    if (!isDesktop) {
      console.log(`🚫 [Middleware] Blocked: ${pathname}`);
      const url = new URL(DOWNLOAD_URL);
      url.searchParams.set('blocked', 'true');
      return NextResponse.redirect(url);
    }

    console.log(`✅ [Middleware] Allowed: ${pathname}`);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
