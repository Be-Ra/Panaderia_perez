import { db } from '@/prisma/db'
import { CierreCajaCrear } from '@/schemas/cierre'
import { AppError } from '../errores'
import Prisma from '@prisma/client'
import Decimal from 'decimal.js'

export async function listarCierres() {
  return await db.cierreCaja.findMany({
    include: {
      empleado: {
        select: { nombreApellido: true, puesto: true },
      },
      ventas: true,
    },
    orderBy: { fecha: 'desc' },
  })
}

export async function crearCierre(data: CierreCajaCrear) {
  // Verificar que el empleado exista
  const empleado = await db.empleado.findUnique({
    where: { dni: data.dni },
  })

  if (!empleado) {
    throw new AppError(404, 'NOT_FOUND', 'Empleado no encontrado')
  }

  // Verificar que no exista un cierre activo para el mismo turno y fecha
  const cierreExistente = await db.cierreCaja.findFirst({
    where: {
      fecha: new Date(data.fecha),
      turno: data.turno,
    },
  })

  if (cierreExistente) {
    throw new AppError(409, 'CONFLICT', 'Ya existe un cierre para este turno y fecha')
  }

  return await db.cierreCaja.create({
    data: {
      fecha: new Date(data.fecha),
      turno: data.turno,
      dni: data.dni,
    },
    include: {
      empleado: true,
    },
  })
}

export async function verResumen(id: number) {
  const cierre = await db.cierreCaja.findUnique({
    where: { idCierre: id },
    include: {
      empleado: {
        select: { nombreApellido: true, puesto: true },
      },
      ventas: {
        include: {
          detalle: {
            include: {
              producto: {
                include: { stock: true },
              },
            },
          },
        },
      },
    },
  })

  if (!cierre) {
    throw new AppError(404, 'NOT_FOUND', 'Cierre no encontrado')
  }

  const ventas = cierre.ventas

  const totalVentas = ventas.reduce(
    (sum, v) => sum.plus(new Decimal(v.precioFinal)),
    new Decimal(0)
  )

  const totalItems = ventas.reduce(
    (sum, v) => sum + v.detalle.length,
    0
  )

  return {
    id: cierre.idCierre,
    fecha: cierre.fecha,
    turno: cierre.turno,
    empleado: cierre.empleado,
    totalVentas: totalVentas.toString(),
    totalItems,
    cantidadVentas: ventas.length,
    ventas: ventas.map((v) => ({
      nro: v.nroVenta.toString(),
      fecha: v.fecha,
      total: v.precioFinal.toString(),
    })),
  }
}

export async function cerrarCaja(id: number) {
  const cierre = await db.cierreCaja.findUnique({
    where: { idCierre: id },
  })

  if (!cierre) {
    throw new AppError(404, 'NOT_FOUND', 'Cierre no encontrado')
  }

  // Verificar que no tenga ventas pendientes
  const ventasPendientes = await db.venta.count({
    where: {
      idCierre: id,
    },
  })

  // Cerrar el cierre marcándolo como finalizado (si añadimos ese campo)
  // Por ahora, solo retorno el resumen
  return await verResumen(id)
}