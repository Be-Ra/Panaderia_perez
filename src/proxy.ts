import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas que solo puede ver el gerente
const SOLO_GERENTE = ['/empleados', '/proveedores', '/stock']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Sin sesión y ruta protegida → login
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con sesión en /login → dashboard
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Control de roles: rutas restringidas a gerente
  if (token) {
    const role = token.role as string | undefined
    const esRestringida = SOLO_GERENTE.some((ruta) => pathname.startsWith(ruta))

    if (esRestringida && role !== 'gerente') {
      return NextResponse.redirect(new URL('/sin-permiso', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
