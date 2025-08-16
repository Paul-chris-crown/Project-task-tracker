import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set',
    }

    // Try to connect to database
    let dbStatus = 'Unknown'
    let dbError = null
    
    try {
      if (process.env.DATABASE_URL) {
        // Simple query to test connection
        await prisma.$queryRaw`SELECT 1`
        dbStatus = 'Connected'
      } else {
        dbStatus = 'No DATABASE_URL'
      }
    } catch (error) {
      dbStatus = 'Connection failed'
      dbError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        error: dbError
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
