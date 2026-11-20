import Link from 'next/link'

export default function SinPermisoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold text-gray-900">Acceso restringido</h1>
      <p className="text-gray-600 max-w-sm">
        No tenés permisos para ver esta sección. Solo los gerentes pueden acceder aquí.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
      >
        ← Volver al tablero
      </Link>
    </div>
  )
}
