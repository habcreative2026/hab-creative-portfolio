// frontend/app/middleware.ts - ĐƠN GIẢN HÓA

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Chỉ áp dụng cho admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Bỏ qua login page và auth-denied
  if (pathname === "/admin/login" || pathname === "/auth-denied") {
    return NextResponse.next();
  }

  // ⭐ CHỈ CHECK TOKEN TỒN TẠI
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    console.log(`❌ [Middleware] No token, redirect to login`);
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(url);
  }

  // ✅ Có token → cho phép
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
