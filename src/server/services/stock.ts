import { db } from '@/prisma/db'
import { ElementoStockCrear } from '@/schemas/stock'
import Decimal from 'decimal.js'
import { AppError } from '../errores'

export async function listarStock() {
  return await db.elementoStock.findMany()
}

export async function obtenerElemento(id: number) {
  return await db.elementoStock.findUnique({
    where: { idProducto: id },
  })
}

export async function crearElemento(data: ElementoStockCrear) {
  return await db.elementoStock.create({
    data: {
      nombre: data.nombre,
      tipoCategoria: data.tipoCategoria,
      precio: new Decimal(data.precio),
      cantidadActual: new Decimal(data.cantidadActual),
      cantidadMaxima: new Decimal(data.cantidadMaxima),
      stockMinimo: data.stockMinimo ? new Decimal(data.stockMinimo) : new Decimal(0),
      unidadMedida: data.unidadMedida,
    },
  })
}

export async function editarElemento(id: number, data: Partial<ElementoStockCrear>) {
  const updateData: any = { ...data }

  // Convertir valores numéricos a Decimal
  if (updateData.precio !== undefined) {
    updateData.precio = new Decimal(updateData.precio)
  }
  if (updateData.cantidadActual !== undefined) {
    updateData.cantidadActual = new Decimal(updateData.cantidadActual)
  }
  if (updateData.cantidadMaxima !== undefined) {
    updateData.cantidadMaxima = new Decimal(updateData.cantidadMaxima)
  }
  if (updateData.stockMinimo !== undefined) {
    updateData.stockMinimo = new Decimal(updateData.stockMinimo)
  }

  return await db.elementoStock.update({
    where: { idProducto: id },
    data: updateData,
  })
}

export async function eliminarElemento(id: number) {
  // Verificar que no tenga recetas ni detalles de ventas asociados
  const elemento = await db.elementoStock.findUnique({
    where: { idProducto: id },
  })

  if (!elemento) {
    throw new AppError(404, 'NOT_FOUND', 'Elemento no encontrado')
  }

  // Verificar si es materia prima o producto fabricado
  const [materiaPrima, elementoFabricado] = await Promise.all([
    db.materiaPrima.count({ where: { idProducto: id } }),
    db.elementoFabricado.findFirst({ where: { idProducto: id } }),
  ])

  if (materiaPrima > 0 || elementoFabricado) {
    throw new AppError(409, 'CONFLICT', 'No se puede eliminar: el elemento tiene relaciones asociadas')
  }

  return await db.elementoStock.delete({
    where: { idProducto: id },
  })
}

export async function verificarReceta(idProducto: number) {
  // Verificar si el producto es fabricado
  const fabricado = await db.elementoFabricado.findUnique({
    where: { idProducto },
    include: {
      stock: true,
      receta: {
        include: {
          materiaPrima: {
            include: { stock: true },
          },
        },
      },
    },
  })

  if (!fabricado) {
    return { esFabricado: false }
  }

  const materiasPrimasInsuficientes: {
    nombre: string
    actual: string
    necesario: string
    unidad: string
  }[] = []

  for (const itemReceta of fabricado.receta) {
    const stockActual = new Decimal(itemReceta.materiaPrima.stock.cantidadActual)
    const necesario = new Decimal(itemReceta.cantidadNecesaria)

    if (stockActual.comparedTo(necesario) < 0) {
      materiasPrimasInsuficientes.push({
        nombre: itemReceta.materiaPrima.stock.nombre,
        actual: stockActual.toFixed(2),
        necesario: necesario.toFixed(2),
        unidad: itemReceta.materiaPrima.stock.unidadMedida,
      })
    }
  }

  return {
    esFabricado: true,
    nombre: fabricado.stock.nombre,
    insuficiente: materiasPrimasInsuficientes.length > 0,
    materiasPrimasInsuficientes,
  }
}