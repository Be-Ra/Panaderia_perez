import { NextResponse } from 'next/server'

export class AppError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function manejarError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
  }

  if (error instanceof Error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  console.error(error)
  return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
}

export function serializar(data: any): any {
  if (typeof data === 'bigint' || typeof data === 'number') {
    return data.toString()
  }
  if (Array.isArray(data)) {
    return data.map(serializar)
  }
  if (data && typeof data === 'object') {
    const result: any = {}
    for (const key in data) {
      result[key] = serializar(data[key])
    }
    return result
  }
  return data
}