import { NextRequest, NextResponse } from 'next/server'
import { manejarError, serializar } from '@/server/errores'
import { obtenerAlertas } from '@/server/services/alertas'

export async function GET(request: NextRequest) {
  try {
    const alertas = await obtenerAlertas()
    return NextResponse.json(serializar(alertas))
  } catch (e) {
    return manejarError(e)
  }
}