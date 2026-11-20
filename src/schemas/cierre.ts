import { z } from 'zod'

export const cierreCajaCrearSchema = z.object({
  fecha: z.string(),
  turno: z.enum(['mañana', 'tarde', 'noche']),
  dni: z.number(),
})

export type CierreCajaCrear = z.infer<typeof cierreCajaCrearSchema>
