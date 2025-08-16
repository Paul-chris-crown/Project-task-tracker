import { NextResponse } from 'next/server'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set',
      ALLOWED_USERS: process.env.ALLOWED_USERS ? 'Set' : 'Not set',
    }

    // Check if ALLOWED_USERS can be parsed
    let usersStatus = 'Unknown'
    let usersError = null
    
    try {
      if (process.env.ALLOWED_USERS) {
        const users = JSON.parse(process.env.ALLOWED_USERS)
        usersStatus = `Parsed successfully (${users.length} users)`
      } else {
        usersStatus = 'Not set - using fallback'
      }
    } catch (error) {
      usersStatus = 'Parse failed'
      usersError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      authentication: {
        status: usersStatus,
        error: usersError,
        note: 'No database required - using environment variables'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
