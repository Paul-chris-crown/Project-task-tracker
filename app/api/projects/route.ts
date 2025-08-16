import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = {
      name: body.name,
      description: body.description || null,
      startDate: body.startDate,
      dueDate: body.dueDate,
      status: body.status || 'ACTIVE',
    }

    // Get the current authenticated user
    const currentUser = await requireAuth()
    
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

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        ownerId: user.id,
      },
      include: {
        owner: true,
        tasks: {
          include: {
            assignee: true,
            creator: true,
          }
        },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        tasks: {
          include: {
            assignee: true,
            creator: true,
          }
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Delete all projects (this will cascade to delete tasks due to foreign key constraints)
    await prisma.project.deleteMany()
    
    return NextResponse.json({ message: 'All projects deleted successfully' })
  } catch (error) {
    console.error('Error deleting all projects:', error)
    return NextResponse.json(
      { error: 'Failed to delete projects' },
      { status: 500 }
    )
  }
}
