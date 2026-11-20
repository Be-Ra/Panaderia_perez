import { z } from 'zod'

export const elementoStockCrearSchema = z.object({
  nombre: z.string().min(1).max(60),
  tipoCategoria: z.string().max(30).optional(),
  precio: z.number().min(0),
  cantidadActual: z.number().min(0),
  cantidadMaxima: z.number().min(0),
  stockMinimo: z.number().min(0).optional(),
  unidadMedida: z.string().max(15),
})

export type ElementoStockCrear = z.infer<typeof elementoStockCrearSchema>