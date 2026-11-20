import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { registrarVenta, listarVentas } from '@/server/services/ventas'

const itemVentaSchema = z.object({
  idProducto: z.number(),
  cantidad: z.number().min(0.01),
  precioIndividual: z.number().min(0),
})

const ventaCrearSchema = z.object({
  dni: z.number(),
  idCierre: z.number().optional(),
  canalVenta: z.enum(['mostrador', 'encargo']),
  items: z.array(itemVentaSchema).min(1),
  fecha: z.string().optional(),
})

export async function GET() {
  try {
    const ventas = await listarVentas()
    return NextResponse.json(serializar(ventas))
  } catch (e) {
    return manejarError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = ventaCrearSchema.parse(body)

    console.log('Venta a registrar:', datos)

    const venta = await registrarVenta(datos, body.dni || 0)
    return NextResponse.json(venta, { status: 201 })
  } catch (e) {
    return manejarError(e)
  }
}