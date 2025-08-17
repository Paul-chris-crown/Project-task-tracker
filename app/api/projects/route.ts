import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Debug: Log all cookies
    console.log('All cookies:', cookieStore.getAll())
    
    // Check if user is authenticated
    const adminAuthCookie = cookieStore.get('admin_auth')
    console.log('Admin auth cookie:', adminAuthCookie)
    
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = {
      name: body.name,
      description: body.description || null,
      status: body.status || 'ACTIVE',
      startDate: body.startDate ? new Date(body.startDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    }

    // Get user information from cookies
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')
    
    console.log('User email cookie:', userEmail)
    console.log('User role cookie:', userRole)

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 404 }
      )
    }

    // Find or create the user in the database
    console.log('Looking for user with email:', userEmail.value)
    let user = await prisma.user.findUnique({
      where: { email: userEmail.value }
    })
    
    console.log('Existing user found:', user)
    
    if (!user) {
      console.log('Creating new user with data:', {
        name: userEmail.value.split('@')[0],
        email: userEmail.value,
        role: userRole.value,
      })
      
      user = await prisma.user.create({
        data: {
          name: userEmail.value.split('@')[0],
          email: userEmail.value,
          role: userRole.value,
        },
      })
      
      console.log('New user created:', user)
    }

    // Create the project in the database
    console.log('Creating project with data:', {
      ...validatedData,
      ownerId: user.id,
    })
    
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

    console.log('Project created successfully:', project)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

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

    // Fetch projects from database
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
    const cookieStore = cookies()
    
    // Check if user is authenticated
    const adminAuthCookie = cookieStore.get('admin_auth')
    if (!adminAuthCookie || adminAuthCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Delete all projects from database
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
