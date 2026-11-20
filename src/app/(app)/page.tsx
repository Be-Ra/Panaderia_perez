import { connection } from 'next/server'
import { obtenerAlertas } from '@/server/services/alertas'
import { listarVentas } from '@/server/services/ventas'

// El dashboard consulta la DB y usa la fecha actual → siempre dinámico
export default async function DashboardPage() {
  // Esperar la conexión real del usuario (evita prerender con new Date())
  await connection()

  // Obtener datos del día
  const hoy = new Date()
  const ventasHoy = await listarVentas({
    fechaDesde: new Date(hoy.setHours(0, 0, 0, 0)),
    fechaHasta: new Date(hoy.setHours(23, 59, 59, 999)),
  })

  const totalVentasHoy = ventasHoy.reduce(
    (sum: number, v) => sum + Number(v.precioFinal),
    0
  )

  // Obtener alertas
  const alertas = await obtenerAlertas()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tablero</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Total ventas del día
          </h3>
          <p className="text-3xl font-bold text-green-700">
            ${totalVentasHoy.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Stock bajo
          </h3>
          <p className="text-3xl font-bold text-red-700">
            {alertas.stockBajo.length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Productos por repositar</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Ventas de hoy
          </h3>
          <p className="text-3xl font-bold text-blue-700">
            {ventasHoy.length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Registradas hoy</p>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Alertas importantes</h2>
        {alertas.tieneAlertas ? (
          <div className="space-y-3">
            {alertas.stockBajo.length > 0 && (
              <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                <p className="font-semibold text-red-900 mb-2">Stock bajo:</p>
                <ul className="text-sm text-red-800 space-y-1">
                  {alertas.stockBajo.map((p) => (
                    <li key={p.id}>
                      • <strong>{p.nombre}</strong>: {p.actual} {p.unidad}{' '}
                      <span className="text-red-700">(mín: {p.minimo})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {alertas.vencimientos.materiasPrimas.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md">
                <p className="font-semibold text-yellow-900 mb-2">Vencimientos próximos:</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {alertas.vencimientos.materiasPrimas.map((mp) => (
                    <li key={mp.id}>
                      • <strong>{mp.nombre}</strong>:{' '}
                      {mp.fechaCaducidad
                        ? new Date(mp.fechaCaducidad).toLocaleDateString()
                        : 'Sin fecha'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-700">✅ No hay alertas en este momento.</p>
        )}
      </div>
    </div>
  )
}
