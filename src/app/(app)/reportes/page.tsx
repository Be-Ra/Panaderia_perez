'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'

const reporteSchema = z.object({
  fechaDesde: z.string().min(1, 'Fecha desde es requerida'),
  fechaHasta: z.string().min(1, 'Fecha hasta es requerida'),
})

type ReporteFormData = z.infer<typeof reporteSchema>

export default function ReportesPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [reporte, setReporte] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReporteFormData>({
    resolver: zodResolver(reporteSchema),
    defaultValues: {
      fechaDesde: '',
      fechaHasta: '',
    },
  })

  // Set today's date client-side to avoid prerender issues
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setValue('fechaDesde', today)
    setValue('fechaHasta', today)
  }, [setValue])

  const onSubmit = async (data: ReporteFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const data = await response.json()
        setReporte(data)
      }
    } catch (error) {
      console.error('Error al generar reporte:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes</h1>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generar reporte</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Fecha desde</label>
              <input
                {...register('fechaDesde')}
                type="date"
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.fechaDesde && (
                <span className="text-red-600 text-sm">
                  {errors.fechaDesde.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha hasta</label>
              <input
                {...register('fechaHasta')}
                type="date"
                className="mt-1 block w-full border rounded p-2"
              />
              {errors.fechaHasta && (
                <span className="text-red-600 text-sm">
                  {errors.fechaHasta.message}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isLoading ? 'Generando...' : 'Generar reporte'}
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

      {reporte && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reporte de ventas</h2>
          <p>Total ventas: ${reporte.total || 0}</p>
          <p>Total ítems: {reporte.items || 0}</p>
        </div>
      )}

      <button
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {mostrarFormulario ? 'Ocultar' : 'Mostrar formulario'}
      </button>
    </div>
  )
}