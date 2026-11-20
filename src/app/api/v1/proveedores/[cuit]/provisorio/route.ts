import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { marcarProvisorio, homologarProveedor } from '@/server/services/proveedores'

const provisorioSchema = z.object({
  motivo: z.string().min(1).max(80),
  fechaVenc: z.string().optional(),
})

export async function PUT(request: NextRequest, context: { params: Promise<{ cuit: string }> }) {
  try {
    const params = await context.params
    const data = await request.json()
    const datos = provisorioSchema.parse(data)

    const proveedor = await marcarProvisorio(params.cuit, {
      motivo: datos.motivo,
      fechaVenc: datos.fechaVenc,
    })
    return NextResponse.json(serializar(proveedor))
  } catch (e) {
    return manejarError(e)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ cuit: string }> }) {
  try {
    const params = await context.params
    await homologarProveedor(params.cuit)
    return NextResponse.json({ success: true })
  } catch (e) {
    return manejarError(e)
  }
}
