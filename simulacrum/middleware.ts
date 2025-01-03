import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('x-url', request.url)
  return response
}

// JOHN this is too broad
export const config = {
  matcher: '/:path*',
}
