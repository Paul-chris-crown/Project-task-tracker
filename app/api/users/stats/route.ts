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
      where: { email: userEmail.value }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userEmail.value.split('@')[0],
          email: userEmail.value,
          role: userRole.value,
        },
      })
    }

    // Fetch real statistics from database
    const [totalProjects, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      prisma.project.count({
        where: { ownerId: user.id }
      }),
      prisma.task.count({
        where: { createdById: user.id }
      }),
      prisma.task.count({
        where: { 
          createdById: user.id,
          status: 'COMPLETED'
        }
      }),
      prisma.task.count({
        where: { 
          createdById: user.id,
          status: { in: ['TODO', 'IN_PROGRESS'] }
        }
      })
    ])

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get recent activity
    const recentProjects = await prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        tasks: {
          include: {
            assignee: true,
            creator: true,
          }
        }
      }
    })

    const recentTasks = await prisma.task.findMany({
      where: { createdById: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        project: true,
        assignee: true,
        creator: true,
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      recentProjects,
      recentTasks,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
