import { db } from '@/prisma/db'
import { EmpleadoCrear, EmpleadoActualizar } from '@/schemas/empleado'
import { AppError } from '../errores'
import bcrypt from 'bcryptjs'
export async function listarEmpleados() {
  return await db.empleado.findMany()
}

export async function obtenerEmpleado(dni: number) {
  const empleado = await db.empleado.findUnique({
    where: { dni },
  })
  return empleado
}

export async function crearEmpleado(datos: EmpleadoCrear) {
  // Verificar que el usuario único no exista ya
  if (datos.usuario) {
    const existe = await db.empleado.findFirst({
      where: { usuario: datos.usuario },
    })
    if (existe) {
      throw new AppError(409, 'CONFLICT', 'El usuario ya existe')
    }
  }

  // Hashear contraseña si se proporciona
  let passwordHash: string | undefined
  if (datos.passwordHash) {
    passwordHash = await bcrypt.hash(datos.passwordHash, 10)
  }

  if (datos.dni === undefined) {
    throw new AppError(400, 'BAD_REQUEST', 'El DNI es requerido para crear un empleado')
  }

  const empleado = await db.empleado.create({
    data: {
      dni: datos.dni,
      nombreApellido: datos.nombreApellido,
      telefono: datos.telefono,
      puesto: datos.puesto,
      accesoSistema: datos.accesoSistema || false,
      usuario: datos.usuario,
      passwordHash,
      metricaAsistencias: datos.metricaAsistencias || 0,
    },
  })

  return empleado
}

export async function actualizarEmpleado(dni: number, datos: EmpleadoActualizar) {
  const updateData: any = { ...datos }

  // Hashear contraseña si se proporciona
  if (datos.passwordHash) {
    updateData.passwordHash = await bcrypt.hash(datos.passwordHash, 10)
  }

  const empleado = await db.empleado.update({
    where: { dni },
    data: updateData,
  })

  return empleado
}

export async function eliminarEmpleado(dni: number) {
  // Verificar que el empleado no tenga ventas ni cierres asociados
  const tieneVentas = await db.venta.findFirst({
    where: { dni },
  })

  const tieneCierres = await db.cierreCaja.findFirst({
    where: { dni },
  })

  if (tieneVentas || tieneCierres) {
    throw new AppError(409, 'CONFLICT', 'No se puede eliminar: el empleado tiene ventas o cierres asociados')
  }

  // Hacer baja lógica - desactivar acceso
  const empleado = await db.empleado.update({
    where: { dni },
    data: { accesoSistema: false },
  })

  return empleado
}
