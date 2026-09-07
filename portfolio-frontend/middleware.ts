// portfolio-frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const isDesktopApp = request.headers.get("x-desktop-app") === "true";

  const isAdminDashboard =
    pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard");
  const isElectron =
    userAgent.includes("Electron") ||
    userAgent.includes("HAB Creative") ||
    referer.includes("desktop-app") ||
    isDesktopApp ||
    request.headers.get("sec-fetch-site") === "same-origin";

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isLocalDev =
    request.headers.get("origin")?.includes("localhost") ||
    request.headers.get("host")?.includes("localhost") ||
    request.headers.get("origin")?.includes("127.0.0.1");

  if (isAdminDashboard && !isElectron && !isLocalDev) {
    console.log(`[Middleware] Chặn truy cập: ${pathname} từ trình duyệt web`);
    console.log(`   User-Agent: ${userAgent}`);
    console.log(`   Desktop App: ${isDesktopApp}`);

    const redirectUrl = new URL("https://trongbui-swe.vercel.app");
    redirectUrl.searchParams.set("redirected_from", "browser_access");
    redirectUrl.searchParams.set("target", pathname);

    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminDashboard && (isElectron || isLocalDev)) {
    console.log(
      `[Middleware] Cho phép truy cập: ${pathname} từ ${isElectron ? "Electron App" : "Local Dev"}`,
    );

    const response = NextResponse.next();
    response.headers.set("x-app-source", "desktop-app");
    return response;
  }

  const isBot =
    userAgent.includes("Googlebot") ||
    userAgent.includes("Bingbot") ||
    userAgent.includes("Slurp") ||
    userAgent.includes("DuckDuckBot") ||
    userAgent.includes("Baiduspider") ||
    userAgent.includes("YandexBot") ||
    userAgent.includes("facebookexternalhit") ||
    userAgent.includes("Twitterbot") ||
    userAgent.includes("WhatsApp") ||
    userAgent.includes("TelegramBot");

  if (isBot && isAdminDashboard) {
    console.log(`[Middleware] Bot truy cập: ${pathname}`);
    const redirectUrl = new URL("https://trongbui-swe.vercel.app");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard",
    "/admin/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
