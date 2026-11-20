'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const stockSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  tipoCategoria: z.string().optional(),
  precio: z.string().min(0.01, 'Precio es requerido'),
  cantidadActual: z.string().min(0, 'Cantidad actual es requerida'),
  cantidadMaxima: z.string().min(1, 'Cantidad máxima es requerida'),
  stockMinimo: z.string().optional(),
  unidadMedida: z.string().min(1, 'Unidad de medida es requerida'),
})

type StockFormData = z.infer<typeof stockSchema>

export default function StockPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [stock, setStock] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [productoEditando, setProductoEditando] = useState<any>(null)

  useEffect(() => {
    cargarStock()
  }, [])

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
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
  })

  const onSubmit = async (data: StockFormData) => {
    setIsLoading(true)
    setMensaje(null)
    try {
      const url = productoEditando
        ? `/api/v1/stock/${productoEditando.idProducto}`
        : '/api/v1/stock'
      const method = productoEditando ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMensaje(
          productoEditando ? 'Producto actualizado' : 'Producto creado'
        )
        setMostrarFormulario(false)
        setProductoEditando(null)
        reset()
        cargarStock()
      } else {
        throw new Error('Error al guardar producto')
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al guardar producto')
    } finally {
      setIsLoading(false)
    }
  }

  const onEditar = (producto: any) => {
    setProductoEditando(producto)
    reset({
      nombre: producto.nombre,
      tipoCategoria: producto.tipoCategoria,
      precio: producto.precio.toString(),
      cantidadActual: producto.cantidadActual.toString(),
      cantidadMaxima: producto.cantidadMaxima.toString(),
      stockMinimo: producto.stockMinimo.toString(),
      unidadMedida: producto.unidadMedida,
    })
    setMostrarFormulario(true)
  }

  const onEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const response = await fetch(`/api/v1/stock/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMensaje('Producto eliminado correctamente')
          cargarStock()
        } else {
          throw new Error('Error al eliminar')
        }
      } catch (error: any) {
        setMensaje(error.message || 'Error al eliminar producto')
      }
    }
  }

  const onVerReceta = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/stock/${id}/receta`)
      if (response.ok) {
        const receta = await response.json()
        alert(JSON.stringify(receta, null, 2))
      }
    } catch (error) {
      alert('Error al obtener receta')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock</h1>
        <button
          onClick={() => {
            setProductoEditando(null)
            setMostrarFormulario(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo producto
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {productoEditando ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                {...register('nombre')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.nombre && (
                <span className="text-red-600 text-sm">
                  {errors.nombre.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <input
                {...register('tipoCategoria')}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Precio</label>
              <input
                {...register('precio')}
                type="number"
                step="0.01"
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.precio && (
                <span className="text-red-600 text-sm">
                  {errors.precio.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Cantidad actual</label>
              <input
                {...register('cantidadActual')}
                type="number"
                step="0.01"
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.cantidadActual && (
                <span className="text-red-600 text-sm">
                  {errors.cantidadActual.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Cantidad máxima</label>
              <input
                {...register('cantidadMaxima')}
                type="number"
                step="0.01"
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock mínimo</label>
              <input
                {...register('stockMinimo')}
                type="number"
                step="0.01"
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Unidad de medida</label>
              <input
                {...register('unidadMedida')}
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.unidadMedida && (
                <span className="text-red-600 text-sm">
                  {errors.unidadMedida.message}
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
                  setProductoEditando(null)
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stock.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-3 text-center text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              stock.map((producto) => (
                <tr key={producto.idProducto}>
                  <td className="px-6 py-3">{producto.nombre}</td>
                  <td className="px-6 py-3">
                    ${producto.precio.toFixed(2)}
                  </td>
                  <td className="px-6 py-3">
                    {producto.cantidadActual.toFixed(2)} {producto.unidadMedida}
                    {producto.cantidadActual < producto.stockMinimo && (
                      <span className="text-red-600 text-xs"> (bajo)</span>
                    )}
                  </td>
                  <td className="px-6 py-3">{producto.unidadMedida}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => onEditar(producto)}
                      className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onVerReceta(producto.idProducto)}
                      className="px-2 py-1 ml-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
                    >
                      Receta
                    </button>
                    <button
                      onClick={() => onEliminar(producto.idProducto)}
                      className="px-2 py-1 ml-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
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