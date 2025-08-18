import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

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

    const body = await request.json()
    const validatedData = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: body.projectId,
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

    // Check if the user owns the project
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Only project owners can create tasks
    if (project.owner.email !== userEmail.value && userRole.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only create tasks in projects you own' },
        { status: 403 }
      )
    }

    // Create the task in the database
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        createdById: user.id,
      },
      include: {
        project: { include: { owner: true } },
        assignee: true,
        creator: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    let whereClause: any = {}

    if (projectId) {
      whereClause.projectId = projectId
    }

    // Fetch tasks from database
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: { include: { owner: true } },
        assignee: true,
        creator: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
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

    // Delete all tasks from database
    await prisma.task.deleteMany()
    
    return NextResponse.json({ message: 'All tasks deleted successfully' })
  } catch (error) {
    console.error('Error deleting all tasks:', error)
    return NextResponse.json(
      { error: 'Failed to delete tasks' },
      { status: 500 }
    )
  }
}
