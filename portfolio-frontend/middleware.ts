// portfolio-frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // ⭐ Kiểm tra header từ desktop app
  const isDesktopApp = request.headers.get('x-desktop-app') === 'true';
  
  // 🚫 Chặn truy cập vào admin/dashboard từ trình duyệt web
  const isAdminDashboard = pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard');
  
  // Kiểm tra xem có phải từ Electron app không
  const isElectron = 
    userAgent.includes('Electron') || 
    userAgent.includes('HAB Creative') ||
    referer.includes('desktop-app') ||
    isDesktopApp;

  // Kiểm tra có phải từ localhost dev không
  const isLocalDev = 
    request.headers.get('origin')?.includes('localhost') ||
    request.headers.get('host')?.includes('localhost') ||
    request.headers.get('origin')?.includes('127.0.0.1');

  // Nếu là admin/dashboard và KHÔNG PHẢI từ Electron hoặc local dev
  if (isAdminDashboard && !isElectron && !isLocalDev) {
    console.log(`🚫 [Middleware] Chặn truy cập: ${pathname} từ trình duyệt web`);
    console.log(`   User-Agent: ${userAgent}`);
    console.log(`   Desktop App: ${isDesktopApp}`);
    
    // Redirect đến website https://bhtdev.work
    const redirectUrl = new URL('https://bhtdev.work');
    redirectUrl.searchParams.set('redirected_from', 'browser_access');
    redirectUrl.searchParams.set('target', pathname);
    
    return NextResponse.redirect(redirectUrl);
  }

  // Cho phép truy cập nếu từ Electron hoặc local dev
  if (isAdminDashboard && (isElectron || isLocalDev)) {
    console.log(`✅ [Middleware] Cho phép truy cập: ${pathname} từ ${isElectron ? 'Electron App' : 'Local Dev'}`);
    
    const response = NextResponse.next();
    response.headers.set('x-app-source', 'desktop-app');
    return response;
  }

  // ⭐ Thêm: Chặn crawl từ bot
  const isBot = 
    userAgent.includes('Googlebot') ||
    userAgent.includes('Bingbot') ||
    userAgent.includes('Slurp') ||
    userAgent.includes('DuckDuckBot') ||
    userAgent.includes('Baiduspider') ||
    userAgent.includes('YandexBot') ||
    userAgent.includes('facebookexternalhit') ||
    userAgent.includes('Twitterbot') ||
    userAgent.includes('WhatsApp') ||
    userAgent.includes('TelegramBot');

  if (isBot && isAdminDashboard) {
    console.log(`🤖 [Middleware] Bot truy cập: ${pathname}`);
    const redirectUrl = new URL('https://bhtdev.work');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// ⭐ Cấu hình matcher
export const config = {
  matcher: [
    '/admin/dashboard',
    '/admin/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*', // Bảo vệ cả API routes
  ],
};
