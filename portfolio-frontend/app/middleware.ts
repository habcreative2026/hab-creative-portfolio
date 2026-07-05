// frontend/app/middleware.ts

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
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(url);
  }

  // ⭐ Kiểm tra token với backend (optional, để tăng bảo mật)
  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
        credentials: "include",
      },
    });

    if (!response.ok) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("status", "session_expired");
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Middleware auth check error:", error);
    // Nếu backend không response, vẫn cho phép request (fallback)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Exclude static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
