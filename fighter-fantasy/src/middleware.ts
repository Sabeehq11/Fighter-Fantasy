import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For now, we'll handle auth redirects on the client side
// This middleware can be expanded later for server-side auth checks

export function middleware(request: NextRequest) {
  // Just pass through for now
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 