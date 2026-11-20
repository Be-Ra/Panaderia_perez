import { db } from '@/prisma/db'
import { VentaCrear } from '@/schemas/venta'
import { AppError } from '../errores'
import Decimal from 'decimal.js'

export async function registrarVenta(data: VentaCrear, empleadoId: number) {
  // Calcular precio final
  let precioFinal = new Decimal(0)
  for (const item of data.items) {
    precioFinal = precioFinal.plus(
      new Decimal(item.precioIndividual).times(item.cantidad)
    )
  }

  // Verificar stock antes de crear la venta
  for (const item of data.items) {
    const producto = await db.elementoFabricado.findUnique({
      where: { idProducto: item.idProducto },
      include: { stock: true },
    })

    if (!producto) {
      throw new AppError(404, 'NOT_FOUND', `Producto ${item.idProducto} no encontrado`)
    }

    const stockActual = new Decimal(producto.stock.cantidadActual.toString())
    const necesario = new Decimal(item.cantidad)

    if (stockActual.comparedTo(necesario) < 0) {
      throw new AppError(409, 'STOCK_INSUFICIENTE',
        `Stock insuficiente para ${producto.stock.nombre}: ${stockActual.toFixed(2)} ${producto.stock.unidadMedida} disponible`)
    }
  }

  // La fecha como string; si no se provee, usar fecha actual
  const fechaStr: string = data.fecha ?? new Date().toISOString()

  // Crear la venta en una transacción
  const venta = await db.$transaction(async (tx) => {
    // Obtener o crear cierre de caja
    let cierre = await tx.cierreCaja.findFirst({
      where: {
        fecha: {
          equals: new Date(fechaStr),
        },
      },
    })

    if (!cierre) {
      cierre = await tx.cierreCaja.create({
        data: {
          fecha: new Date(fechaStr),
          turno: 'caja',
          dni: empleadoId,
        },
      })
    }

    // Crear venta
    const nuevaVenta = await tx.venta.create({
      data: {
        fecha: new Date(fechaStr),
        canalVenta: data.canalVenta,
        dni: empleadoId,
        precioFinal: precioFinal,
        idCierre: cierre.idCierre,
      },
    })

    // Crear detalles y actualizar stock
    for (const item of data.items) {
      await tx.detalleVenta.create({
        data: {
          nroVenta: nuevaVenta.nroVenta,
          idProducto: item.idProducto,
          cantidad: new Decimal(item.cantidad),
          precioIndividual: new Decimal(item.precioIndividual),
        },
      })

      // Actualizar stock
      await tx.elementoStock.update({
        where: { idProducto: item.idProducto },
        data: {
          cantidadActual: {
            decrement: new Decimal(item.cantidad),
          },
        },
      })
    }

    return nuevaVenta
  })

  return {
    id: venta.nroVenta.toString(),
    fecha: venta.fecha,
    total: venta.precioFinal.toString(),
    items: 0, // Se actualizará después
  }
}

export async function listarVentas(filtro?: {
  fechaDesde?: Date
  fechaHasta?: Date
  canal?: string
}) {
  const where: any = {}

  if (filtro?.fechaDesde && filtro?.fechaHasta) {
    where.fecha = {
      gte: filtro.fechaDesde,
      lte: filtro.fechaHasta,
    }
  } else if (filtro?.fechaDesde) {
    where.fecha = { gte: filtro.fechaDesde }
  } else if (filtro?.fechaHasta) {
    where.fecha = { lte: filtro.fechaHasta }
  }

  if (filtro?.canal) {
    where.canalVenta = filtro.canal
  }

  return await db.venta.findMany({
    where,
    include: {
      empleado: {
        select: { nombreApellido: true },
      },
      detalle: {
        include: {
          producto: {
            include: { stock: true },
          },
        },
      },
    },
    orderBy: { fecha: 'desc' },
  })
}

export async function obtenerVenta(nro: string) {
  return await db.venta.findUnique({
    where: { nroVenta: BigInt(nro) },
    include: {
      empleado: {
        select: { nombreApellido: true, puesto: true },
      },
      detalle: {
        include: {
          producto: {
            include: { stock: true },
          },
        },
      },
    },
  })
}
