import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Check if user is authenticated
    const adminAuthCookie = cookieStore.get('admin_auth')
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return mock stats data (no database needed)
    return NextResponse.json({
      totalUsers: 1,
      activeUsers: 1,
      newUsersThisMonth: 0,
      userGrowth: 0,
      topUsers: [
        {
          email: cookieStore.get('user_email')?.value || 'user@example.com',
          role: cookieStore.get('user_role')?.value || 'MEMBER',
          projectCount: 0,
          taskCount: 0
        }
      ]
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
