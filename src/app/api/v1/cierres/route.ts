import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { manejarError, serializar } from '@/server/errores'
import { listarCierres, crearCierre } from '@/server/services/cierres'

const cierreSchema = z.object({
  fecha: z.string().optional(),
  turno: z.enum(['mañana', 'tarde', 'noche']),
  dni: z.number(),
})

export async function GET() {
  try {
    const cierres = await listarCierres()
    return NextResponse.json(serializar(cierres))
  } catch (e) {
    return manejarError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = cierreSchema.parse(body)

    console.log('Creando cierre:', datos)

    const cierre = await crearCierre({
      fecha: datos.fecha ?? new Date().toISOString(),
      turno: datos.turno,
      dni: datos.dni,
    })
    return NextResponse.json(serializar(cierre), { status: 201 })
  } catch (e) {
    return manejarError(e)
  }
}
