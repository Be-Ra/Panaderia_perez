import { z } from 'zod'

export const empleadoCrearSchema = z.object({
  dni: z.number().optional(),
  nombreApellido: z.string().min(1).max(60),
  telefono: z.string().max(20).optional(),
  puesto: z.enum(['caja', 'panadero', 'pastelero', 'gerente']),
  accesoSistema: z.boolean().optional(),
  usuario: z.string().min(1).max(20).optional(),
  passwordHash: z.string().min(1).max(255).optional(),
  metricaAsistencias: z.number().min(0).max(100).optional(),
})

export const empleadoActualizarSchema = empleadoCrearSchema.partial()

export type EmpleadoCrear = z.infer<typeof empleadoCrearSchema>
export type EmpleadoActualizar = z.infer<typeof empleadoActualizarSchema>