import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { listarStock, crearElemento } from '@/server/services/stock'

const stockSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  tipoCategoria: z.string().optional(),
  precio: z.number().min(0),
  cantidadActual: z.number().min(0),
  cantidadMaxima: z.number().min(0),
  stockMinimo: z.number().min(0).optional(),
  unidadMedida: z.string().min(1, 'Unidad de medida es requerida'),
})

export async function GET() {
  try {
    const stock = await listarStock()
    return NextResponse.json(serializar(stock))
  } catch (e) {
    return manejarError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = stockSchema.parse(body)

    console.log('Creando stock:', datos)

    const elemento = await crearElemento(datos)
    return NextResponse.json(serializar(elemento), { status: 201 })
  } catch (e) {
    return manejarError(e)
  }
}