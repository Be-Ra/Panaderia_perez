'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const itemVentaSchema = z.object({
  idProducto: z.number(),
  cantidad: z.number().min(0.01, 'Cantidad es requerida'),
})

const ventaSchema = z.object({
  canalVenta: z.enum(['mostrador', 'encargo']),
  items: z.array(itemVentaSchema).min(1, 'Agregar al menos un producto'),
})

type VentaFormData = z.infer<typeof ventaSchema>

export default function VentasPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ventas, setVentas] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null)

  useEffect(() => {
    cargarVentas()
    cargarStock()
  }, [])

  const cargarVentas = async () => {
    try {
      const response = await fetch('/api/v1/ventas')
      if (response.ok) {
        const data = await response.json()
        setVentas(data)
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error)
    }
  }

  const cargarStock = async () => {
    try {
      const response = await fetch('/api/v1/stock')
      if (response.ok) {
        const data = await response.json()
        setStock(data)
      }
    } catch (error) {
      console.error('Error al cargar stock:', error)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      canalVenta: 'mostrador',
      items: [],
    },
  })

  const onSubmit = async (data: VentaFormData) => {
    setIsLoading(true)
    setMensaje(null)
    try {
      const response = await fetch('/api/v1/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMensaje('Venta registrada correctamente')
        setMostrarFormulario(false)
        reset()
      } else {
        throw new Error('Error al registrar venta')
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al registrar venta')
    } finally {
      setIsLoading(false)
    }
  }

  const agregarItem = () => {
    if (productoSeleccionado) {
      const currentItems = (reset as any)('_reset')?.items || []
      // This is a simplified approach - in production you'd use a proper state management
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <button
          onClick={() => {
            setMostrarFormulario(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nueva venta
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Nueva venta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Canal</label>
              <select
                {...register('canalVenta')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="mostrador">Mostrador</option>
                <option value="encargo">Encargo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Productos</label>
              <select
                {...register('items.0.idProducto')}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">Seleccionar producto</option>
                {stock.map((producto) => (
                  <option key={producto.idProducto} value={producto.idProducto}>
                    {producto.nombre} (${producto.precio.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Cantidad</label>
              <input
                {...register('items.0.cantidad')}
                type="number"
                step="0.01"
                defaultValue={1}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.items?.[0]?.cantidad && (
                <span className="text-red-600 text-sm">
                  {errors.items[0].cantidad.message}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isLoading ? 'Registrando...' : 'Registrar venta'}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Canal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-3 text-center text-gray-500">
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.slice(0, 20).map((venta) => (
                <tr key={venta.nroVenta}>
                  <td className="px-6 py-3">
                    {new Date(venta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">{venta.nroVenta}</td>
                  <td className="px-6 py-3">{venta.canalVenta}</td>
                  <td className="px-6 py-3">
                    ${venta.precioFinal.toFixed(2)}
                  </td>
                  <td className="px-6 py-3">{venta.detalle?.length || 0}</td>
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