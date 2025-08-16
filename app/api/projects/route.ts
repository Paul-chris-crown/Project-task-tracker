import { NextRequest, NextResponse } from 'next/server'
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
      name: body.name,
      description: body.description || null,
      status: body.status || 'ACTIVE',
      startDate: body.startDate,
      dueDate: body.dueDate,
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

    // Return mock project data (no database needed)
    const mockProject = {
      id: `project_${Date.now()}`,
      ...validatedData,
      ownerId: userEmail.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: userEmail.value,
        name: userEmail.value.split('@')[0],
        email: userEmail.value,
        role: userRole.value
      },
      tasks: []
    }

    return NextResponse.json(mockProject)
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

    // Return mock projects data (no database needed)
    const mockProjects = [
      {
        id: 'project_1',
        name: 'Sample Project 1',
        description: 'This is a sample project',
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ownerId: 'user@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'user@example.com',
          name: 'User',
          email: 'user@example.com',
          role: 'MEMBER'
        },
        tasks: []
      }
    ]

    return NextResponse.json(mockProjects)
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
    // This functionality is removed as per the new_code, as the project data is now mock.
    // If a database is re-introduced, this function would need to be updated.
    
    return NextResponse.json({ message: 'Project deletion is not available in mock mode.' })
  } catch (error) {
    console.error('Error deleting all projects:', error)
    return NextResponse.json(
      { error: 'Failed to delete projects' },
      { status: 500 }
    )
  }
}
