import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  // Rutas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico']
  const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isPublicPath) {
    if (!token && req.nextUrl.pathname === '/login') {
      return NextResponse.next()
    }
    if (token && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Proteger todas las demás rutas
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}