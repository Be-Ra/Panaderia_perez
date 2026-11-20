import { db } from '@/prisma/db'
import { ProveedorCrear, ProveedorProvisorio } from '@/schemas/proveedor'
import { AppError } from '../errores'

export async function listarProveedores() {
  return await db.proveedor.findMany()
}

export async function obtenerProveedor(cuit: string) {
  return await db.proveedor.findUnique({
    where: { cuit },
  })
}

export async function crearProveedor(data: ProveedorCrear) {
  return await db.proveedor.create({
    data: {
      cuit: data.cuit,
      razonSocial: data.razonSocial,
      direccion: data.direccion,
      contacto: data.contacto,
      condicionesPago: data.condicionesPago,
    },
  })
}

export async function editarProveedor(cuit: string, data: Partial<ProveedorCrear>) {
  return await db.proveedor.update({
    where: { cuit },
    data,
  })
}

export async function eliminarProveedor(cuit: string) {
  // Verificar que no tenga suministros asociados
  const proveedor = await db.proveedor.findUnique({
    where: { cuit },
    include: { suministros: true },
  })

  if (!proveedor) {
    throw new AppError(404, 'NOT_FOUND', 'Proveedor no encontrado')
  }

  if (proveedor.suministros.length > 0) {
    throw new AppError(409, 'CONFLICT', 'No se puede eliminar: el proveedor tiene suministros asociados')
  }

  // Eliminar proveedor provisorio si existe
  await db.proveedorProvisorio.deleteMany({
    where: { cuit },
  })

  return await db.proveedor.delete({
    where: { cuit },
  })
}

export async function marcarProvisorio(
  cuit: string,
  data: ProveedorProvisorio
) {
  // Verificar que el proveedor exista
  const proveedor = await db.proveedor.findUnique({
    where: { cuit },
  })

  if (!proveedor) {
    throw new AppError(404, 'NOT_FOUND', 'Proveedor no encontrado')
  }

  // data.fechaVenc es opcional según el schema; usamos la fecha actual como fallback
  const fechaVenc = data.fechaVenc ? new Date(data.fechaVenc) : new Date()

  return await db.proveedorProvisorio.create({
    data: {
      cuit,
      fechaVencProvisorio: fechaVenc,
      motivo: data.motivo,
    },
  })
}

export async function homologarProveedor(cuit: string) {
  // Verificar que el proveedor exista y sea provisorio
  const tieneProvisorio = await db.proveedorProvisorio.findUnique({
    where: { cuit },
  })

  if (!tieneProvisorio) {
    throw new AppError(404, 'NOT_FOUND', 'No es un proveedor provisorio')
  }

  // Eliminar el registro de proveedor provisorio
  await db.proveedorProvisorio.delete({
    where: { cuit },
  })

  return { success: true }
}

export async function limpiarProvisoriosVencidos() {
  const hoy = new Date()
  return await db.proveedorProvisorio.deleteMany({
    where: {
      fechaVencProvisorio: {
        lt: hoy,
      },
    },
  })
}
