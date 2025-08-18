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
          // We'll calculate assigned tasks as created tasks with IN_PROGRESS status
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
          // We'll calculate assigned tasks as created tasks with IN_PROGRESS status
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
      projectCount: user.ownedProjects.length,
      taskCount: user.createdTasks.length,
      assignedTaskCount: user.createdTasks.filter(task => task.status === 'IN_PROGRESS').length,
      // Include actual project objects for detailed display
      ownedProjects: user.ownedProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        description: project.description,
        startDate: project.startDate,
        dueDate: project.dueDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        // Include task count for this project
        taskCount: project.tasks.length,
        completedTaskCount: project.tasks.filter(task => task.status === 'COMPLETED').length,
      })),
      // Include created tasks for detailed display
      createdTasks: user.createdTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        description: task.description,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        projectName: task.project?.name || 'Unknown Project',
        projectId: task.project?.id,
      })),
      // Include assigned tasks (created tasks with IN_PROGRESS status) for detailed display
      assignedTasks: user.createdTasks
        .filter(task => task.status === 'IN_PROGRESS')
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          description: task.description,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          projectName: task.project?.name || 'Unknown Project',
          projectId: task.project?.id,
        })),
    }))

    // Calculate organization-wide stats
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      try {
        return new Date() > new Date(task.dueDate)
      } catch (error) {
        console.error('Error parsing due date:', task.dueDate, error)
        return false
      }
    }).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    console.log('Team stats calculated:', {
      totalUsers: usersWithStats.length,
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate
    })

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
