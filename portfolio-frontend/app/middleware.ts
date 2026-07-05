// frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DOWNLOAD_URL = "https://bhtdev.work"; // ⭐ Trang download

// ⭐ Kiểm tra desktop app
function isDesktopApp(userAgent: string): boolean {
  return userAgent.includes('HABCreativeDesktop');
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  const isDesktop = isDesktopApp(userAgent);

  // ⭐ CHỈ CHO PHÉP ADMIN ROUTES QUA DESKTOP APP
  if (pathname.startsWith("/admin")) {
    // Nếu KHÔNG phải desktop app → redirect về trang download
    if (!isDesktop) {
      console.log(`🚫 Blocked admin access from web: ${pathname}`);
      const url = new URL(DOWNLOAD_URL);
      url.searchParams.set('blocked', 'true');
      url.searchParams.set('reason', 'admin_only_desktop');
      return NextResponse.redirect(url);
    }

    // Desktop app: cho phép, kiểm tra token
    if (pathname === "/admin/login" || pathname === "/auth-denied") {
      return NextResponse.next();
    }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      console.log(`❌ [Middleware] No token, redirect to login`);
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("status", "unauthorized");
      return NextResponse.redirect(url);
    }

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
