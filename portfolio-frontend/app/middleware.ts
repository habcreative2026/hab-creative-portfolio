// frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DOWNLOAD_URL = "https://bhtdev.work";

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
    // Bỏ qua auth-denied
    if (pathname === "/auth-denied") {
      return NextResponse.next();
    }

    // Nếu KHÔNG phải desktop app → redirect về trang download
    if (!isDesktop) {
      console.log(`🚫 Blocked admin access from web: ${pathname}`);
      console.log(`📱 User-Agent: ${userAgent}`);
      
      const url = new URL(DOWNLOAD_URL);
      url.searchParams.set('blocked', 'true');
      url.searchParams.set('reason', 'admin_only_desktop');
      return NextResponse.redirect(url);
    }

    // ⭐ Desktop app: cho phép
    console.log(`✅ Desktop app allowed: ${pathname}`);
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
