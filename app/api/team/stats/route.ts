import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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

    // Get user info from cookies
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 400 }
      )
    }

    // Fetch user from database to get current role
    const user = await prisma.user.findUnique({
      where: { email: userEmail.value }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch data based on user role
    let usersWithStats
    let projects
    let tasks

    if (user.role === 'ADMIN') {
      // Admins can see all data
      usersWithStats = await prisma.user.findMany({
        include: {
          ownedProjects: {
            include: {
              tasks: true,
            },
          },
          createdTasks: {
            include: {
              project: true,
            },
          },
          assignedTasks: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      projects = await prisma.project.findMany({
        include: {
          owner: true,
          tasks: true,
        },
      })

      tasks = await prisma.task.findMany({
        include: {
          project: true,
          assignee: true,
          creator: true,
        },
      })
    } else {
      // Members can see their own data and basic team stats
      usersWithStats = await prisma.user.findMany({
        include: {
          ownedProjects: {
            include: {
              tasks: true,
            },
          },
          createdTasks: {
            include: {
              project: true,
            },
          },
          assignedTasks: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      projects = await prisma.project.findMany({
        include: {
          owner: true,
          tasks: true,
        },
      })

      tasks = await prisma.task.findMany({
        include: {
          project: true,
          assignee: true,
          creator: true,
        },
      })
    }

    // Calculate stats for each user
    const usersWithStatsData = usersWithStats.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      projectCount: user.role === 'ADMIN' ? user.ownedProjects.length : user.ownedProjects.length,
      taskCount: user.role === 'ADMIN' ? user.createdTasks.length : user.createdTasks.length,
      assignedTaskCount: user.role === 'ADMIN' ? user.assignedTasks.length : user.assignedTasks.length,
    }))

    // Calculate organization-wide stats
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date() > new Date(task.dueDate)
    }).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      users: usersWithStatsData,
      organizationStats: {
        totalProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        totalUsers: usersWithStats.length,
        activeUsers: usersWithStats.length,
        completionRate,
      },
      projects,
      tasks,
      userRole: user.role,
    })
  } catch (error) {
    console.error('Error fetching team stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    )
  }
}
