import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * The Prisma client instance.
 *
 * @see {@link https://www.prisma.io/docs/concepts/components/prisma-client}
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db