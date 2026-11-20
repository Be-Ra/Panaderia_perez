import 'dotenv/config'

export default {
  schema: 'prisma/schema.prisma',
  output: './src/prisma/generated',
  migrations: {
    dir: 'migrations',
  },
}