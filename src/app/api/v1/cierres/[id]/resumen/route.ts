import { NextRequest, NextResponse } from 'next/server'
import { manejarError, serializar } from '@/server/errores'
import { verResumen } from '@/server/services/cierres'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const resumen = await verResumen(parseInt(params.id))
    return NextResponse.json(serializar(resumen))
  } catch (e) {
    return manejarError(e)
  }
}
