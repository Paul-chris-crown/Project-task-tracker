import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in a build environment
const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL
}

// Create Prisma client only when not in build environment
const createPrismaClient = () => {
  // Skip Prisma client creation during build time
  if (isBuildTime()) {
    return null
  }
  
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    return null
  }
}

// Create a safe Prisma client that handles build-time scenarios
const createSafePrismaClient = () => {
  const client = globalForPrisma.prisma ?? createPrismaClient()
  
  if (!client) {
    // Return a mock client that provides better error messages
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        if (typeof prop === 'string') {
          return new Proxy({}, {
            get() {
              return () => {
                if (isBuildTime()) {
                  console.warn(`Prisma operation ${prop} called during build time - returning null`)
                  return Promise.resolve(null)
                }
                throw new Error('Database connection not available. Please check your DATABASE_URL environment variable.')
              }
            }
          })
        }
        return undefined
      }
    })
  }
  
  return client
}

export const prisma = createSafePrismaClient()

if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
