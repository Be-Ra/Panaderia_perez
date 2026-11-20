import { Session } from 'next-auth'
import { NextResponse } from 'next/server'

export type Rol = 'caja' | 'panadero' | 'pastelero' | 'gerente'

const ROLES_PERMISOS: Record<Rol, string[]> = {
  gerente: [
    'empleados:crud',
    'proveedores:crud',
    'stock:crud',
    'stock:recetas',
    'ventas:crud',
    'cierres:crud',
    'reportes',
  ],
  caja: ['ventas', 'cierres', 'stock'],
  panadero: ['stock', 'stock:recetas'],
  pastelero: ['stock', 'stock:recetas'],
}

export async function requireAuth(req: Request): Promise<{ authorized: boolean; session?: Session; error?: string }> {
  // Esta función se usará en los Route Handlers
  // La verificación real se hace a través de next-auth
  return { authorized: true }
}

export function tieneRol(
  session: Session | null,
  rolesPermitidos: Rol[]
): boolean {
  if (!session?.user) return false
  const userRol = (session.user as any).role as Rol | undefined
  if (!userRol) return false

  const permisos = ROLES_PERMISOS[userRol] || []

  // El rol debe estar en la lista de roles permitidos
  return rolesPermitidos.includes(userRol)
}

export async function requireRole(
  req: Request,
  roles: Rol[]
): Promise<{ authorized: boolean; role?: string; error?: string }> {
  // Esta función se usará para verificar roles en los Route Handlers
  // Para ahora, devuelve autorizado (la verificación real será con next-auth)
  return { authorized: true }
}

export function middlewareRequireRole(
  session: Session | null,
  roles: Rol[]
): NextResponse | null {
  if (!tieneRol(session, roles)) {
    return NextResponse.json(
      { error: 'Permiso denegado' },
      { status: 403 }
    )
  }
  return null
}