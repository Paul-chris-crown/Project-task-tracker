import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
        { error: 'Authentication required' },
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

    // Find or create the user in the database
    let user = await prisma.user.findUnique({
      where: { email: userEmail.value },
      include: {
        projects: {
          include: {
            tasks: true,
          },
        },
        createdTasks: true,
        assignedTasks: true,
      },
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userEmail.value.split('@')[0],
          email: userEmail.value,
          role: userRole.value,
        },
        include: {
          projects: {
            include: {
              tasks: true,
            },
          },
          createdTasks: true,
          assignedTasks: true,
        },
      })
    }

    // Calculate user stats
    const userWithStats = {
      ...user,
      projectCount: user.projects.length,
      taskCount: user.createdTasks.length,
      assignedTaskCount: user.assignedTasks.length,
    }

    return NextResponse.json(userWithStats)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
