import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { obtenerElemento, editarElemento, eliminarElemento } from '@/server/services/stock'

const elementoSchema = z.object({
  nombre: z.string().min(1).optional(),
  tipoCategoria: z.string().optional(),
  precio: z.number().min(0).optional(),
  cantidadActual: z.number().min(0).optional(),
  cantidadMaxima: z.number().min(0).optional(),
  stockMinimo: z.number().min(0).optional(),
  unidadMedida: z.string().optional(),
})

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const elemento = await obtenerElemento(parseInt(params.id))
    if (!elemento) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 })
    }
    return NextResponse.json(serializar(elemento))
  } catch (e) {
    return manejarError(e)
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const data = await request.json()
    const datos = elementoSchema.parse(data)
    const elemento = await editarElemento(parseInt(params.id), datos)
    return NextResponse.json(serializar(elemento))
  } catch (e) {
    return manejarError(e)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    await eliminarElemento(parseInt(params.id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return manejarError(e)
  }
}