import { z } from 'zod'

export const itemVentaSchema = z.object({
  idProducto: z.number(),
  cantidad: z.number().min(0.01),
  precioIndividual: z.number().min(0),
})

export const ventaCrearSchema = z.object({
  dni: z.number(),
  idCierre: z.number().optional(),
  canalVenta: z.enum(['mostrador', 'encargo']),
  items: z.array(itemVentaSchema).min(1),
  fecha: z.string().optional(),
})

export type VentaCrear = z.infer<typeof ventaCrearSchema>