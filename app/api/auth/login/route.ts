import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error: ADMIN_PASSWORD not set' },
        { status: 500 }
      )
    }

    // Check if password matches admin password
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Get allowed users from environment variable
    const allowedUsersStr = process.env.ALLOWED_USERS || '[]'
    let allowedUsers: Array<{ email: string; role: string }> = []
    
    try {
      allowedUsers = JSON.parse(allowedUsersStr)
    } catch (error) {
      console.error('Failed to parse ALLOWED_USERS:', error)
      // Fallback to a default admin user if parsing fails
      allowedUsers = [{ email: 'admin@example.com', role: 'ADMIN' }]
    }

    // Check if email exists in allowed users list
    const allowedUser = allowedUsers.find((user: { email: string; role: string }) => 
      user.email.toLowerCase() === email.toLowerCase()
    )

    if (!allowedUser) {
      return NextResponse.json(
        { error: 'Email not authorized to access this application' },
        { status: 403 }
      )
    }

    // Set secure cookie with user information
    const cookieStore = cookies()
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Also store user email and role for future use
    cookieStore.set('user_email', allowedUser.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    cookieStore.set('user_role', allowedUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ 
      success: true,
      user: {
        email: allowedUser.email,
        role: allowedUser.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
