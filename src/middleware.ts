import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }

  // Add proper MIME types for static files
  if (request.nextUrl.pathname.match(/\.(js|jsx|ts|tsx)$/)) {
    response.headers.set('Content-Type', 'application/javascript')
  } else if (request.nextUrl.pathname.match(/\.css$/)) {
    response.headers.set('Content-Type', 'text/css')
  } else if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    response.headers.set('Content-Type', 'image/' + request.nextUrl.pathname.split('.').pop())
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
