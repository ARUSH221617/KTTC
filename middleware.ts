import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";

// Function to check if admin is authenticated based on cookie
function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token");
  if (!token?.value) {
    return false;
  }
  return validateAdminSession(token.value);
}

export default function middleware(request: NextRequest) {
  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Only apply middleware logic to non-API routes (admin pages, not API)
  if (!pathname.startsWith("/api/")) {
    // Check if the path is an admin path
    const isAdminPath =
      pathname.startsWith("/admin") && !pathname.startsWith("/_next");

    // Check if user is authenticated with admin cookie
    const isAdminAuthenticatedUser = isAdminAuthenticated(request);

    // If trying to access admin routes but not authenticated, redirect to login
    if (isAdminPath && !isAdminAuthenticatedUser) {
      const newUrl = new URL("/login", request.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }

    // If authenticated admin and trying to access login page, redirect to admin dashboard
    if (isAdminAuthenticatedUser && pathname === "/login") {
      const newUrl = new URL("/admin", request.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This includes both page routes and API routes
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
