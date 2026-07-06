import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_session'

// Presence-only check: is there a session cookie at all? The backend is the
// real authority — every API call still carries the token and gets a 401 if
// it's invalid or expired, which callers handle by redirecting to /login.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(COOKIE_NAME)
  const { pathname } = request.nextUrl

  if (!hasSession && pathname !== '/login') {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Everything except static assets and the favicon.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
