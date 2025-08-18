import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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

    // Get authorized users from environment variable
    const allowedUsersStr = process.env.ALLOWED_USERS || '[]'
    let allowedUsers: Array<{ email: string; role: string }> = []
    
    try {
      allowedUsers = JSON.parse(allowedUsersStr)
    } catch (error) {
      console.error('Failed to parse ALLOWED_USERS:', error)
      // Fallback to a default admin user if parsing fails
      allowedUsers = [{ email: 'adeofdefi@gmail.com', role: 'ADMIN' }]
    }

    // Check if email is authorized
    const allowedUser = allowedUsers.find((user: { email: string; role: string }) => 
      user.email.toLowerCase() === email.toLowerCase()
    )

    if (!allowedUser) {
      return NextResponse.json(
        { error: 'Email not authorized to access this application' },
        { status: 403 }
      )
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // If user doesn't exist, create them with their authorized role
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0], // Use email prefix as name
          role: allowedUser.role // Use the role from ALLOWED_USERS
        }
      })
    } else {
      // Update existing user's role to match their authorized role
      user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { role: allowedUser.role }
      })
    }

    // Set secure cookie with user information
    const cookieStore = cookies()
    
    // Set cookies with proper configuration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: undefined, // Let the browser set the domain
    }
    
    cookieStore.set('admin_auth', 'true', cookieOptions)
    cookieStore.set('user_email', user.email, cookieOptions)
    cookieStore.set('user_role', user.role, cookieOptions)
    
    console.log('Cookies set:', {
      admin_auth: 'true',
      user_email: user.email,
      user_role: user.role
    })

    return NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        role: user.role
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
