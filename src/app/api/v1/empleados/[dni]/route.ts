import { NextRequest, NextResponse } from 'next/server'
import { empleadoActualizarSchema } from '@/schemas/empleado'
import { obtenerEmpleado, actualizarEmpleado, eliminarEmpleado } from '@/server/services/empleados'
import { manejarError, serializar } from '@/server/errores'

export async function GET(request: NextRequest, context: { params: Promise<{ dni: string }> }) {
  try {
    const params = await context.params
    const empleado = await obtenerEmpleado(parseInt(params.dni))
    if (!empleado) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
    }
    return NextResponse.json(serializar(empleado))
  } catch (e) {
    return manejarError(e)
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ dni: string }> }) {
  try {
    const params = await context.params
    const body = await request.json()
    const datos = empleadoActualizarSchema.parse(body)
    const empleado = await actualizarEmpleado(parseInt(params.dni), datos)
    return NextResponse.json(serializar(empleado))
  } catch (e) {
    return manejarError(e)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ dni: string }> }) {
  try {
    const params = await context.params
    await eliminarEmpleado(parseInt(params.dni))
    return NextResponse.json({ message: 'Empleado eliminado' })
  } catch (e) {
    return manejarError(e)
  }
}
