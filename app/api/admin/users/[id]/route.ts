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

    // Check if user is admin
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || userRole?.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, role } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from editing their own role
    if (existingUser.email === userEmail.value && role && role !== existingUser.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role. Ask another admin to do this for you.' },
        { status: 400 }
      )
    }

    // Prevent changing the primary admin's role (adeofdefi@gmail.com)
    if (role && role !== existingUser.role) {
      // Check if this is the primary admin email
      if (existingUser.email === 'adeofdefi@gmail.com') {
        return NextResponse.json(
          { error: 'Cannot change the role of the primary admin (adeofdefi@gmail.com). This account is protected.' },
          { status: 400 }
        )
      }
      
      // Check if current user is trying to change their own role
      if (existingUser.email === userEmail.value) {
        return NextResponse.json(
          { error: 'Cannot change your own role. Ask another admin to do this for you.' },
          { status: 400 }
        )
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        role: role || existingUser.role,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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

    // Check if user is admin
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')

    if (!userEmail || userRole?.value !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves or the primary admin
    if (existingUser.email === userEmail.value) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }
    
    // Prevent deletion of the primary admin
    if (existingUser.email === 'adeofdefi@gmail.com') {
      return NextResponse.json(
        { error: 'Cannot delete the primary admin account (adeofdefi@gmail.com). This account is protected.' },
        { status: 400 }
      )
    }

    // Delete user from database (this will cascade to delete related projects and tasks)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
