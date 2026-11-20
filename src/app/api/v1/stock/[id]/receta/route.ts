import { NextRequest, NextResponse } from 'next/server'
import { manejarError, serializar } from '@/server/errores'
import { verificarReceta } from '@/server/services/stock'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const receta = await verificarReceta(parseInt(params.id))
    return NextResponse.json(serializar(receta))
  } catch (e) {
    return manejarError(e)
  }
}
