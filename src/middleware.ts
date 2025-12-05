import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Define protected routes that require authentication
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/api/login') || pathname.startsWith('/login') || pathname === '/') {
    return NextResponse.next();
  }
  
  // Check for admin token in cookies
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    // Redirect to login if no token exists and accessing protected route
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Verify the token
  const session = await verifyAdminSession(token);
  
  if (!session) {
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }
  
  // Allow the request to continue if token is valid
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/(api\/.*)',
  ],
};