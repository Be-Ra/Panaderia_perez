'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const proveedorSchema = z.object({
  cuit: z.string().min(11, 'CUIT debe tener al menos 11 caracteres'),
  razonSocial: z.string().min(1, 'Razón social es requerida'),
  direccion: z.string().optional(),
  contacto: z.string().optional(),
  condicionesPago: z.string().optional(),
})

type ProveedorFormData = z.infer<typeof proveedorSchema>

export default function ProveedoresPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    try {
      const response = await fetch('/api/v1/proveedores')
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
  })

  const onSubmit = async (data: ProveedorFormData) => {
    setIsLoading(true)
    setMensaje(null)
    try {
      const response = await fetch('/api/v1/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMensaje('Proveedor creado correctamente')
        setMostrarFormulario(false)
        reset()
        cargarProveedores()
      } else {
        throw new Error('Error al crear proveedor')
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al crear proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  const onEliminar = async (cuit: string) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/v1/proveedores/${cuit}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMensaje('Proveedor eliminado correctamente')
          cargarProveedores()
        } else {
          throw new Error('Error al eliminar')
        }
      } catch (error: any) {
        setMensaje(error.message || 'Error al eliminar proveedor')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo proveedor
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Crear proveedor</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">CUIT</label>
              <input
                {...register('cuit')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.cuit && (
                <span className="text-red-600 text-sm">{errors.cuit.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Razón social</label>
              <input
                {...register('razonSocial')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.razonSocial && (
                <span className="text-red-600 text-sm">{errors.razonSocial.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Dirección</label>
              <input
                {...register('direccion')}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Contacto</label>
              <input
                {...register('contacto')}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Condiciones de pago</label>
              <input
                {...register('condicionesPago')}
                className="mt-1 block w-full border rounded p-2"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUIT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razón Social</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-3 text-center text-gray-500">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              proveedores.map((proveedor) => (
                <tr key={proveedor.cuit}>
                  <td className="px-6 py-3">{proveedor.cuit}</td>
                  <td className="px-6 py-3">{proveedor.razonSocial}</td>
                  <td className="px-6 py-3">{proveedor.contacto}</td>
                  <td className="px-6 py-3">{proveedor.condicionesPago}</td>
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