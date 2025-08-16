import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Check if user is authenticated
    const adminAuthCookie = cookieStore.get('admin_auth')
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user information from cookies
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 404 }
      )
    }

    // Return user information from cookies (no database needed)
    return NextResponse.json({
      user: {
        id: userEmail.value, // Use email as ID since no database
        email: userEmail.value,
        role: userRole.value,
        name: userEmail.value.split('@')[0] // Extract name from email
      }
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
