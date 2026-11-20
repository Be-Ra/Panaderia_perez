import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { listarProveedores } from '@/server/services/proveedores'

const proveedorSchema = z.object({
  cuit: z.string().length(13),
  razonSocial: z.string().min(1).max(60),
  direccion: z.string().max(80).optional(),
  contacto: z.string().max(60).optional(),
  condicionesPago: z.string().max(80).optional(),
})

export async function GET() {
  try {
    const proveedores = await listarProveedores()
    return NextResponse.json(serializar(proveedores))
  } catch (e) {
    return manejarError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = proveedorSchema.parse(body)

    console.log('Creando proveedor:', datos)

    // TODO: Implementar creación
    return NextResponse.json({ message: 'Proveedor creado (pendiente)' }, { status: 201 })
  } catch (e) {
    return manejarError(e)
  }
}