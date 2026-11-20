import { NextRequest } from 'next/server'
import { signIn } from 'next-auth/react'
import { manejarError } from '@/server/errores'
import { crearEmpleado } from '@/server/services/empleados'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { usuario, password, nombreApellido, puesto } = body

    // Crear empleado con acceso (para demo)
    const empleado = await crearEmpleado({
      usuario,
      passwordHash: password,
      nombreApellido,
      puesto,
      accesoSistema: true,
    })

    return Response.json(
      { message: 'Empleado creado', empleado },
      { status: 201 }
    )
  } catch (e) {
    return manejarError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    // Este endpoint se usará para /api/auth/session vía next-auth
    return Response.json({ authenticated: false })
  } catch (e) {
    return manejarError(e)
  }
}