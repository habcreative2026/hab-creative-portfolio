import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Kiểm tra nếu là web browser (không phải Electron)
  const isDesktop = userAgent.includes('Electron') || userAgent.includes('Portfolio');
  
  // Danh sách route cần chặn trên web
  const protectedRoutes = ['/admin/dashboard', '/admin/login'];
  
  // Nếu không phải desktop và đang truy cập route protected
  if (!isDesktop && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Chuyển hướng về trang chủ
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
