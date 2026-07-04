// portfolio-frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Chỉ áp dụng cho admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Bỏ qua login và auth-denied
  if (pathname === "/admin/login" || pathname === "/auth-denied") {
    return NextResponse.next();
  }

  // ⭐ CHỈ KIỂM TRA TOKEN TỒN TẠI, KHÔNG VERIFY VỚI BACKEND
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    console.log(`❌ [Middleware] No token, redirect to login`);
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(url);
  }

  // ✅ Có token → cho phép vào
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
