import { db } from '@/prisma/db'
import Decimal from 'decimal.js'

export async function verificarStockBajo() {
  const elementos = await db.elementoStock.findMany()

  const elementosBajos: {
    id: number
    nombre: string
    actual: string
    minimo: string
    unidad: string
  }[] = []

  for (const elem of elementos) {
    const actual = new Decimal(elem.cantidadActual)
    const minimo = new Decimal(elem.stockMinimo)

    if (actual.lt(minimo)) {
      elementosBajos.push({
        id: elem.idProducto,
        nombre: elem.nombre,
        actual: actual.toFixed(2),
        minimo: minimo.toFixed(2),
        unidad: elem.unidadMedida,
      })
    }
  }

  return elementosBajos
}

export async function vencimientos() {
  const hoy = new Date()
  const mañana = new Date()
  mañana.setDate(mañana.getDate() + 7) // Próximos 7 días

  // Materia prima con vencimientos próximos
  const materiasPrimas = await db.materiaPrima.findMany({
    where: {
      fechaCaducidad: {
        gte: hoy,
        lt: mañana,
      },
    },
    include: {
      stock: true,
    },
  })

  // Elementos fabricados con fecha de consumo recomendado próxima
  const elementosFabricados = await db.elementoFabricado.findMany({
    where: {
      fechaConsumoRecomendada: {
        gte: hoy,
        lt: mañana,
      },
    },
    include: {
      stock: true,
    },
  })

  return {
    materiasPrimas: materiasPrimas.map((mp) => ({
      id: mp.idProducto,
      nombre: mp.stock.nombre,
      unidad: mp.stock.unidadMedida,
      fechaCaducidad: mp.fechaCaducidad,
      stockActual: mp.stock.cantidadActual,
    })),
    elementosFabricados: elementosFabricados.map((ef) => ({
      id: ef.idProducto,
      nombre: ef.stock.nombre,
      unidad: ef.stock.unidadMedida,
      fechaConsumoRecomendada: ef.fechaConsumoRecomendada,
      stockActual: ef.stock.cantidadActual,
    })),
  }
}

export async function obtenerAlertas() {
  const [stockBajo, vencimientosHoy] = await Promise.all([
    verificarStockBajo(),
    vencimientos(),
  ])

  return {
    stockBajo,
    vencimientos: vencimientosHoy,
    tieneAlertas: stockBajo.length > 0 || vencimientosHoy.materiasPrimas.length > 0 || vencimientosHoy.elementosFabricados.length > 0,
  }
}

export async function actualizarStockMateriaPrima(
  idProducto: number,
  cantidad: number,
  operacion: 'suma' | 'resta'
) {
  const cantidadDecimal = new Decimal(cantidad)

  if (operacion === 'suma') {
    await db.materiaPrima.update({
      where: { idProducto },
      data: {
        stock: {
          update: {
            where: { idProducto },
            data: {
              cantidadActual: {
                increment: cantidadDecimal,
              },
            },
          },
        },
      },
    })
  } else {
    await db.materiaPrima.update({
      where: { idProducto },
      data: {
        stock: {
          update: {
            where: { idProducto },
            data: {
              cantidadActual: {
                decrement: cantidadDecimal,
              },
            },
          },
        },
      },
    })
  }
}