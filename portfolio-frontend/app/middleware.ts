// // frontend/app/middleware.ts - ĐƠN GIẢN HÓA

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   // Chỉ áp dụng cho admin routes
//   if (!pathname.startsWith("/admin")) {
//     return NextResponse.next();
//   }

//   // Bỏ qua login page và auth-denied
//   if (pathname === "/admin/login" || pathname === "/auth-denied") {
//     return NextResponse.next();
//   }

//   // ⭐ CHỈ CHECK TOKEN TỒN TẠI
//   const token = request.cookies.get("auth_token")?.value;

//   if (!token) {
//     console.log(`❌ [Middleware] No token, redirect to login`);
//     const url = new URL("/admin/login", request.url);
//     url.searchParams.set("status", "unauthorized");
//     return NextResponse.redirect(url);
//   }

//   // ✅ Có token → cho phép
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };
// frontend/app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_DENIED_URL = "/auth-denied";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ⭐ CHỈ ÁP DỤNG CHO ADMIN ROUTES
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ⭐ CHO PHÉP TRUY CẬP /admin/login (để nhập license/QR)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ⭐ CHO PHÉP /auth-denied (hiển thị trang bị chặn)
  if (pathname === "/auth-denied") {
    return NextResponse.next();
  }

  // ⭐ KIỂM TRA TOKEN CHO CÁC ROUTE CÒN LẠI (/admin/dashboard, /admin/settings, ...)
  const token = request.cookies.get("auth_token")?.value;
  const urlToken = request.nextUrl.searchParams.get("token");

  // ⭐ Nếu có token trong URL (từ QR scan) → set cookie và redirect
  if (urlToken && !token) {
    console.log(`✅ [Middleware] Token from URL, redirecting to set cookie`);
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.set("auth_token", urlToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  }

  // ⭐ NẾU KHÔNG CÓ TOKEN → CHẶN TRUY CẬP
  if (!token) {
    console.log(`🚫 [Middleware] Blocked access to: ${pathname}`);
    return NextResponse.redirect(new URL(AUTH_DENIED_URL, request.url));
  }

  // ✅ CÓ TOKEN → CHO PHÉP TRUY CẬP
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
