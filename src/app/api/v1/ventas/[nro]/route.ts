import { NextRequest, NextResponse } from 'next/server'
import { manejarError, serializar } from '@/server/errores'
import { obtenerVenta } from '@/server/services/ventas'

export async function GET(request: NextRequest, context: { params: Promise<{ nro: string }> }) {
  try {
    const params = await context.params
    const venta = await obtenerVenta(params.nro)
    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }
    return NextResponse.json(serializar(venta))
  } catch (e) {
    return manejarError(e)
  }
}
