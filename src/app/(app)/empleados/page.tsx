'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const empleadoSchema = z.object({
  nombreApellido: z.string().min(1, 'Nombre es requerido'),
  telefono: z.string().optional(),
  puesto: z.enum(['caja', 'panadero', 'pastelero', 'gerente']),
  usuario: z.string().min(1, 'Usuario es requerido'),
  passwordHash: z.string().min(1, 'Contraseña es requerida'),
  accesoSistema: z.boolean().optional(),
})

type EmpleadoFormData = z.infer<typeof empleadoSchema>

export default function EmpleadosPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const cargarEmpleados = async () => {
    try {
      const response = await fetch('/api/v1/empleados')
      if (response.ok) {
        const data = await response.json()
        setEmpleados(data)
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpleadoFormData>({
    resolver: zodResolver(empleadoSchema),
  })

  const onSubmit = async (data: EmpleadoFormData) => {
    setIsLoading(true)
    setMensaje(null)
    try {
      const response = await fetch('/api/v1/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMensaje('Empleado creado correctamente')
        setMostrarFormulario(false)
        reset()
        cargarEmpleados()
      } else {
        throw new Error('Error al crear empleado')
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al crear empleado')
    } finally {
      setIsLoading(false)
    }
  }

  const onEliminar = async (dni: number) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      try {
        const response = await fetch(`/api/v1/empleados/${dni}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMensaje('Empleado eliminado correctamente')
          cargarEmpleados()
        } else {
          throw new Error('Error al eliminar')
        }
      } catch (error: any) {
        setMensaje(error.message || 'Error al eliminar empleado')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo empleado
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Crear empleado</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                {...register('nombreApellido')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.nombreApellido && (
                <span className="text-red-600 text-sm">{errors.nombreApellido.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Teléfono</label>
              <input
                {...register('telefono')}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Puesto</label>
              <select
                {...register('puesto')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="caja">Caja</option>
                <option value="panadero">Panadero</option>
                <option value="pastelero">Pastelero</option>
                <option value="gerente">Gerente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Usuario</label>
              <input
                {...register('usuario')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.usuario && (
                <span className="text-red-600 text-sm">{errors.usuario.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                {...register('passwordHash')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.passwordHash && (
                <span className="text-red-600 text-sm">{errors.passwordHash.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Acceso sistema</label>
              <input
                type="checkbox"
                {...register('accesoSistema')}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acceso</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-3 text-center text-gray-500">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              empleados.map((empleado) => (
                <tr key={empleado.dni}>
                  <td className="px-6 py-3">{empleado.dni}</td>
                  <td className="px-6 py-3">{empleado.nombreApellido}</td>
                  <td className="px-6 py-3">{empleado.puesto}</td>
                  <td className="px-6 py-3">{empleado.usuario}</td>
                  <td className="px-6 py-3">
                    {empleado.accesoSistema ? 'Sí' : 'No'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mensaje && (
        <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg bg-green-100 text-green-800">
          {mensaje}
        </div>
      )}
    </div>
  )
}