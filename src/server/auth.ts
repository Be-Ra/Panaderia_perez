import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/prisma/db'

/** Devuelve true si DATABASE_URL apunta a una DB real (no al placeholder) */
function tieneDB(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return false
  // El placeholder del .env.example usa "user:password" como credenciales
  if (url.includes('user:password@')) return false
  return true
}

const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        usuario: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.password) {
          return null
        }

        // ── Superusuario de entorno ─────────────────────────────────────────
        // Permite acceso sin base de datos. Configurar en .env:
        //   SUPERUSER_USER=admin
        //   SUPERUSER_PASSWORD=una-clave-segura
        const superUser = process.env.SUPERUSER_USER
        const superPass = process.env.SUPERUSER_PASSWORD
        if (
          superUser &&
          superPass &&
          credentials.usuario === superUser &&
          credentials.password === superPass
        ) {
          return {
            id: '0',
            name: 'Super Admin',
            email: superUser,
            role: 'gerente',
          }
        }
        // ───────────────────────────────────────────────────────────────────

        // Si no hay DB real configurada, no intentar conectarse
        if (!tieneDB()) {
          return null
        }

        // Buscar empleado en la base de datos
        try {
          const empleado = await db.empleado.findFirst({
            where: {
              usuario: credentials.usuario,
              accesoSistema: true,
            },
          })

          if (!empleado || !empleado.passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            empleado.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: empleado.dni.toString(),
            name: empleado.nombreApellido || undefined,
            email: empleado.usuario || undefined,
            role: empleado.puesto || undefined,
          }
        } catch {
          // DB configurada pero no disponible en este momento
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = (user as any).role || undefined
        token.id = user.id || undefined
      }
      return token
    },
    session: ({ session, token }) => {
      if (token) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export { authOptions }
export default authOptions
