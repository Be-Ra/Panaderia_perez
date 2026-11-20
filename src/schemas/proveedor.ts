import { z } from 'zod'

export const proveedorCrearSchema = z.object({
  cuit: z.string().length(13),
  razonSocial: z.string().min(1).max(60),
  direccion: z.string().max(80).optional(),
  contacto: z.string().max(60).optional(),
  condicionesPago: z.string().max(80).optional(),
})

export const proveedorProvisorioSchema = z.object({
  motivo: z.string().min(1).max(80),
  fechaVenc: z.string().optional(),
})

export type ProveedorCrear = z.infer<typeof proveedorCrearSchema>
export type ProveedorProvisorio = z.infer<typeof proveedorProvisorioSchema>