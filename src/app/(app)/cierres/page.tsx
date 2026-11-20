'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const cierreSchema = z.object({
  fecha: z.string().min(1, 'Fecha es requerida'),
  turno: z.enum(['mañana', 'tarde', 'noche']),
  dni: z.number().min(1, 'DNI es requerido'),
})

type CierreFormData = z.infer<typeof cierreSchema>

export default function CierresPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cierres, setCierres] = useState<any[]>([])
  const [empleados, setEmpleados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [resumenActivo, setResumenActivo] = useState<any>(null)

  useEffect(() => {
    cargarCierres()
    cargarEmpleados()
  }, [])

  const cargarCierres = async () => {
    try {
      const response = await fetch('/api/v1/cierres')
      if (response.ok) {
        const data = await response.json()
        setCierres(data)
      }
    } catch (error) {
      console.error('Error al cargar cierres:', error)
    }
  }

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
    setValue,
    formState: { errors },
  } = useForm<CierreFormData>({
    resolver: zodResolver(cierreSchema),
    defaultValues: {
      fecha: '',
      turno: 'mañana',
    },
  })

  // Set today's date client-side to avoid prerender issues
  useEffect(() => {
    setValue('fecha', new Date().toISOString().split('T')[0])
  }, [setValue])

  const onSubmit = async (data: CierreFormData) => {
    setIsLoading(true)
    setMensaje(null)
    try {
      const response = await fetch('/api/v1/cierres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMensaje('Cierre creado correctamente')
        setMostrarFormulario(false)
        reset()
        cargarCierres()
      } else {
        throw new Error('Error al crear cierre')
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al crear cierre')
    } finally {
      setIsLoading(false)
    }
  }

  const onVerResumen = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/cierres/${id}/resumen`)
      if (response.ok) {
        const resumen = await response.json()
        setResumenActivo(resumen)
      }
    } catch (error) {
      setMensaje('Error al cargar resumen')
    }
  }

  const onEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este cierre?')) {
      try {
        const response = await fetch(`/api/v1/cierres/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMensaje('Cierre eliminado correctamente')
          cargarCierres()
        } else {
          throw new Error('Error al eliminar')
        }
      } catch (error: any) {
        setMensaje(error.message || 'Error al eliminar cierre')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cierres de Caja</h1>
        <button
          onClick={() => {
            setMostrarFormulario(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo cierre
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Crear cierre</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Fecha</label>
              <input
                {...register('fecha')}
                type="date"
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.fecha && (
                <span className="text-red-600 text-sm">
                  {errors.fecha.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Turno</label>
              <select
                {...register('turno')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Empleado</label>
              <select
                {...register('dni')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((empleado) => (
                  <option key={empleado.dni} value={empleado.dni}>
                    {empleado.nombreApellido}
                  </option>
                ))}
              </select>
              {errors.dni && (
                <span className="text-red-600 text-sm">
                  {errors.dni.message}
                </span>
              )}
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
                onClick={() => {
                  setMostrarFormulario(false)
                  reset()
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {resumenActivo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Resumen del Cierre #{resumenActivo.id}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Empleado</p>
              <p className="font-semibold">
                {resumenActivo.empleado?.nombreApellido || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Turno</p>
              <p className="font-semibold">{resumenActivo.turno}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total ventas</p>
              <p className="font-semibold">
                ${resumenActivo.totalVentas || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Items vendidos</p>
              <p className="font-semibold">{resumenActivo.totalItems || 0}</p>
            </div>
          </div>
          <button
            onClick={() => setResumenActivo(null)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cerrar resumen
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Turno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ventas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cierres.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-3 text-center text-gray-500">
                  No hay cierres registrados
                </td>
              </tr>
            ) : (
              cierres.slice(0, 20).map((cierre) => (
                <tr key={cierre.idCierre}>
                  <td className="px-6 py-3">
                    {new Date(cierre.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">{cierre.turno}</td>
                  <td className="px-6 py-3">
                    {cierre.empleado?.nombreApellido || '-'}
                  </td>
                  <td className="px-6 py-3">
                    {cierre.ventas?.length || 0} ventas
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => onVerResumen(cierre.idCierre)}
                      className="px-2 py-1 mr-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onEliminar(cierre.idCierre)}
                      className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Eliminar
                    </button>
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