import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      ALLOWED_USERS: process.env.ALLOWED_USERS ? 'Set' : 'Not set',
    }

    let databaseStatus = 'Unknown'
    let databaseError = null

    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`
      databaseStatus = 'Connected successfully'
    } catch (error) {
      databaseStatus = 'Connection failed'
      databaseError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: databaseStatus,
        error: databaseError,
        note: 'Using real PostgreSQL database via Prisma'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
