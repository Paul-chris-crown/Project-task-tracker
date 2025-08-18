import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function GET() {
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

    // Check if user is admin
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || userRole?.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get current allowed users from environment variable
    const allowedUsersStr = process.env.ALLOWED_USERS || '[]'
    let allowedUsers: Array<{ email: string; role: string }> = []
    
    try {
      allowedUsers = JSON.parse(allowedUsersStr)
    } catch (error) {
      console.error('Failed to parse ALLOWED_USERS:', error)
      allowedUsers = []
    }

    return NextResponse.json(allowedUsers)
  } catch (error) {
    console.error('Error fetching allowed users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allowed users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user is admin
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || userRole?.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role } = body

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either ADMIN or MEMBER' },
        { status: 400 }
      )
    }

    // Get current allowed users
    const allowedUsersStr = process.env.ALLOWED_USERS || '[]'
    let allowedUsers: Array<{ email: string; role: string }> = []
    
    try {
      allowedUsers = JSON.parse(allowedUsersStr)
    } catch (error) {
      console.error('Failed to parse ALLOWED_USERS:', error)
      allowedUsers = []
    }

    // Check if user already exists
    const existingUser = allowedUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Add new user
    const newAllowedUser = { email: email.toLowerCase(), role }
    allowedUsers.push(newAllowedUser)

    // Update environment variable (this will require a restart in production)
    // For now, we'll store it in the database as a fallback
    await prisma.allowedUser.upsert({
      where: { email: email.toLowerCase() },
      update: { role },
      create: {
        email: email.toLowerCase(),
        role,
      },
    })

    // Create user in main users table if they don't exist
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role,
        },
      })
    } else {
      // Update existing user's role
      user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { role },
      })
    }

    return NextResponse.json({
      message: 'User added successfully',
      user: newAllowedUser,
      totalAllowedUsers: allowedUsers.length
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding allowed user:', error)
    return NextResponse.json(
      { error: 'Failed to add allowed user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Check if user is admin
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || userRole?.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Get current allowed users
    const allowedUsersStr = process.env.ALLOWED_USERS || '[]'
    let allowedUsers: Array<{ email: string; role: string }> = []
    
    try {
      allowedUsers = JSON.parse(allowedUsersStr)
    } catch (error) {
      console.error('Failed to parse ALLOWED_USERS:', error)
      allowedUsers = []
    }

    // Remove user from allowed users
    const filteredUsers = allowedUsers.filter(user => 
      user.email.toLowerCase() !== email.toLowerCase()
    )

    // Remove from database
    await prisma.allowedUser.deleteMany({
      where: { email: email.toLowerCase() }
    })

    // Also remove from main users table
    await prisma.user.deleteMany({
      where: { email: email.toLowerCase() }
    })

    return NextResponse.json({
      message: 'User removed successfully',
      totalAllowedUsers: filteredUsers.length
    })
  } catch (error) {
    console.error('Error removing allowed user:', error)
    return NextResponse.json(
      { error: 'Failed to remove allowed user' },
      { status: 500 }
    )
  }
}
