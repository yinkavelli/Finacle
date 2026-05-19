import { NextResponse } from 'next/server'

export function middleware(request) {
  // All routes are publicly accessible — auth is handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.csv$).*)'],
}
