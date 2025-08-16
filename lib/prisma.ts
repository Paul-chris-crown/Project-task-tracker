import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client only when not in build environment
const createPrismaClient = () => {
  // Skip Prisma client creation during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return null
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Create a proxy that handles null cases
const createPrismaProxy = () => {
  const client = globalForPrisma.prisma ?? createPrismaClient()
  
  if (!client) {
    // Return a mock client during build time
    return new Proxy({} as PrismaClient, {
      get() {
        return () => Promise.resolve(null)
      }
    })
  }
  
  return client
}

export const prisma = createPrismaProxy()

if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
