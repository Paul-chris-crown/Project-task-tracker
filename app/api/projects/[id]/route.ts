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

    // Check if project exists and get owner info
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
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

    // Check if user has permission to edit (owner or admin)
    if (userRole.value !== 'ADMIN' && project.owner.email !== userEmail.value) {
      return NextResponse.json(
        { error: 'You can only edit projects you own' },
        { status: 403 }
      )
    }

    // Convert date strings to proper DateTime objects
    const validatedData = {
      name: body.name,
      description: body.description || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status,
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        owner: true,
        tasks: true,
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
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

    // Check if project exists and get owner info
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
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

    // Check if user has permission to delete (owner or admin)
    if (userRole.value !== 'ADMIN' && project.owner.email !== userEmail.value) {
      return NextResponse.json(
        { error: 'You can only delete projects you own' },
        { status: 403 }
      )
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
