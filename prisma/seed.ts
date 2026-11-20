import { db } from '../src/prisma/db'
import bcrypt from 'bcryptjs'
import Decimal from 'decimal.js'

async function main() {
  console.log('Sembrando datos de ejemplo...')

  // Crear gerente
  const hashGerente = await bcrypt.hash('gerente123', 10)
  await db.empleado.create({
    data: {
      dni: 20123456,
      nombreApellido: 'Juan García',
      puesto: 'gerente',
      accesoSistema: true,
      usuario: 'juan.garcia',
      passwordHash: hashGerente,
      metricaAsistencias: new Decimal(100),
    },
  })

  // Crear cajero
  const hashCajero = await bcrypt.hash('cajero123', 10)
  await db.empleado.create({
    data: {
      dni: 30234567,
      nombreApellido: 'Ana López',
      puesto: 'caja',
      accesoSistema: true,
      usuario: 'ana.lopez',
      passwordHash: hashCajero,
      metricaAsistencias: new Decimal(95),
    },
  })

  // Crear panadero
  await db.empleado.create({
    data: {
      dni: 25345678,
      nombreApellido: 'Carlos Ruiz',
      puesto: 'panadero',
      accesoSistema: false,
      usuario: null,
      passwordHash: null,
      metricaAsistencias: new Decimal(98),
    },
  })

  // Crear pastelero
  await db.empleado.create({
    data: {
      dni: 27456789,
      nombreApellido: 'María Fernández',
      puesto: 'pastelero',
      accesoSistema: false,
      usuario: null,
      passwordHash: null,
      metricaAsistencias: new Decimal(92),
    },
  })

  // Crear proveedores
  await db.proveedor.create({
    data: {
      cuit: '20-12345678-9',
      razonSocial: 'Proveedor Materias Primas S.R.L.',
      direccion: 'Av. Principal 123, Ciudad',
      contacto: 'Pedro Martínez - 11-2233-4455',
      condicionesPago: 'Transferencia bancaria - 30 días',
    },
  })

  console.log('¡Datos sembrados correctamente!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
