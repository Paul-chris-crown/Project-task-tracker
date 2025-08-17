import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

// Lazy load to prevent build-time database connections
export function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  
  const client = createPrismaClient()
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }
  
  return client
}

// Export a default instance for backward compatibility
export const prisma = getPrismaClient()
