'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/',           label: 'Tablero' },
  { href: '/empleados',  label: 'Empleados' },
  { href: '/proveedores',label: 'Proveedores' },
  { href: '/stock',      label: 'Stock' },
  { href: '/ventas',     label: 'Ventas' },
  { href: '/cierres',    label: 'Cierres de Caja' },
  { href: '/reportes',   label: 'Reportes' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-gray-200 bg-blue-700">
          <h1 className="text-lg font-bold text-white tracking-wide">🥐 Panadería</h1>
          <p className="text-xs text-blue-200 mt-0.5">Sistema de gestión</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? 'flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200'
                    : 'flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
