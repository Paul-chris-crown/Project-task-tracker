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
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      dueDate: body.dueDate,
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

    // Return mock task data (no database needed)
    const mockTask = {
      id: `task_${Date.now()}`,
      ...validatedData,
      createdById: userEmail.value,
      assigneeId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: {
        id: validatedData.projectId,
        name: 'Mock Project'
      },
      assignee: null,
      creator: {
        id: userEmail.value,
        name: userEmail.value.split('@')[0],
        email: userEmail.value,
        role: userRole.value
      }
    }

    return NextResponse.json(mockTask)
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

    // Return mock tasks data (no database needed)
    const mockTasks = [
      {
        id: 'task_1',
        title: 'Sample Task 1',
        description: 'This is a sample task',
        status: 'TODO',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        projectId: projectId || 'project_1',
        assigneeId: null,
        createdById: 'user@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        project: {
          id: projectId || 'project_1',
          name: 'Sample Project'
        },
        assignee: null,
        creator: {
          id: 'user@example.com',
          name: 'User',
          email: 'user@example.com',
          role: 'MEMBER'
        }
      }
    ]

    return NextResponse.json(mockTasks)
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

    // Return success message (no database operation needed)
    return NextResponse.json({ message: 'All tasks deleted successfully' })
  } catch (error) {
    console.error('Error deleting all tasks:', error)
    return NextResponse.json(
      { error: 'Failed to delete tasks' },
      { status: 500 }
    )
  }
}
