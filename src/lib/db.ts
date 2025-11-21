import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure database connection based on environment
const isDevelopment = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL || (isDevelopment ? 'file:./dev.db' : '')

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db