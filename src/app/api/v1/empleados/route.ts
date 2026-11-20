import { NextRequest, NextResponse } from 'next/server'
import { empleadoCrearSchema, empleadoActualizarSchema } from '@/schemas/empleado'
import { listarEmpleados, obtenerEmpleado, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '@/server/services/empleados'
import { manejarError, serializar } from '@/server/errores'

export async function GET() {
  try {
    const empleados = await listarEmpleados()
    return NextResponse.json(serializar(empleados))
  } catch (e) {
    return manejarError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = empleadoCrearSchema.parse(body)

    console.log('Creando empleado:', datos)

    const empleado = await crearEmpleado(datos)
    return NextResponse.json(serializar(empleado), { status: 201 })
  } catch (e) {
    return manejarError(e)
  }
}