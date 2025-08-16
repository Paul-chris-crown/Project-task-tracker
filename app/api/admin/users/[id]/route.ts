import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// Prevent this route from being processed during build time
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin access
    await requireAdmin()

    const { id } = params

    // Check if user exists
    const existingUser = await prisma.allowedUser.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete the allowed user
    await prisma.allowedUser.delete({
      where: { id }
    })

    // Also clean up any related user data
    await prisma.user.deleteMany({
      where: { email: existingUser.email }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting allowed user:', error)
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
