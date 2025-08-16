import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if task exists and get creator info
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { 
        creator: true,
        project: { include: { owner: true } }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to edit (creator, project owner, or admin)
    const canEdit = currentUser.role === 'ADMIN' || 
                   task.creator.email === currentUser.email ||
                   task.project.owner.email === currentUser.email

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You can only edit tasks you created or tasks in projects you own' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = {
      title: body.title,
      description: body.description || null,
      status: body.status,
      dueDate: body.dueDate,
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
    const currentUser = await requireAuth()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if task exists and get creator info
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { 
        creator: true,
        project: { include: { owner: true } }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete (creator, project owner, or admin)
    const canDelete = currentUser.role === 'ADMIN' || 
                     task.creator.email === currentUser.email ||
                     task.project.owner.email === currentUser.email

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You can only delete tasks you created or tasks in projects you own' },
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
