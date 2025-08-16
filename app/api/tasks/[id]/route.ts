import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params

    // Check if task exists and get creator info
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { creator: true, project: true }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
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

    // Check if user has permission to edit (creator, assignee, or admin)
    if (userRole.value !== 'ADMIN' && 
        task.creator.email !== userEmail.value && 
        task.assigneeId !== userEmail.value) {
      return NextResponse.json(
        { error: 'You can only edit tasks you created or are assigned to' },
        { status: 403 }
      )
    }

    // Convert date strings to proper DateTime objects
    const validatedData = {
      title: body.title,
      description: body.description || null,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      assigneeId: body.assigneeId || null,
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if task exists and get creator info
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { creator: true, project: true }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Get user information from cookies
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userRole || !userEmail) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete (creator or admin)
    if (userRole.value !== 'ADMIN' && task.creator.email !== userEmail.value) {
      return NextResponse.json(
        { error: 'You can only delete tasks you created' },
        { status: 403 }
      )
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
