import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { obtenerProveedor, editarProveedor, eliminarProveedor } from '@/server/services/proveedores'

const proveedorSchema = z.object({
  razonSocial: z.string().min(1).optional(),
  direccion: z.string().optional(),
  contacto: z.string().optional(),
  condicionesPago: z.string().optional(),
})

export async function GET(request: NextRequest, context: { params: Promise<{ cuit: string }> }) {
  try {
    const params = await context.params
    const proveedor = await obtenerProveedor(params.cuit)
    if (!proveedor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }
    return NextResponse.json(serializar(proveedor))
  } catch (e) {
    return manejarError(e)
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ cuit: string }> }) {
  try {
    const params = await context.params
    const data = await request.json()
    const datos = proveedorSchema.parse(data)
    const proveedor = await editarProveedor(params.cuit, datos)
    return NextResponse.json(serializar(proveedor))
  } catch (e) {
    return manejarError(e)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ cuit: string }> }) {
  try {
    const params = await context.params
    await eliminarProveedor(params.cuit)
    return NextResponse.json({ success: true })
  } catch (e) {
    return manejarError(e)
  }
}
