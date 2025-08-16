import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      dueDate: body.dueDate,
      projectId: body.projectId,
    }

    // Get the current authenticated user
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find or create the user in the User table
    let user = await prisma.user.findUnique({
      where: { email: currentUser.email }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: currentUser.email.split('@')[0], // Use email prefix as name
          email: currentUser.email,
          role: currentUser.role,
        },
      })
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        projectId: validatedData.projectId,
        createdById: user.id, // Set the creator
      },
      include: {
        project: true,
        assignee: true,
        creator: true, // Include creator information
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
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    let whereClause: any = {}

    if (projectId) {
      whereClause.projectId = projectId
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: true,
        assignee: true,
        creator: true, // Include creator information
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
    // Delete all tasks
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
