// // frontend/app/middleware.ts - HOÀN CHỈNH

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Chỉ áp dụng cho admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Bỏ qua login page và auth-denied
  if (pathname === "/admin/login" || pathname === "/auth-denied") {
    return NextResponse.next();
  }

  // ⭐ Lấy token từ cookie
  const token = request.cookies.get("auth_token")?.value;

  // ⭐ Nếu không có token, redirect về login
  if (!token) {
    console.log(`❌ [Middleware] No token, redirect to login`);
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(url);
  }

  // ⭐⭐ BỎ QUA VERIFY VỚI BACKEND TRONG MIDDLEWARE ⭐⭐
  // Middleware chạy trên Edge, KHÔNG thể gửi cookie sang backend
  // Chỉ cần check token tồn tại là đủ

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
