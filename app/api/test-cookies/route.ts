import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Get all cookies
    const allCookies = cookieStore.getAll()
    
    // Get specific cookies
    const adminAuth = cookieStore.get('admin_auth')
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')
    
    return NextResponse.json({
      message: 'Cookie test endpoint',
      allCookies: allCookies.map(c => ({ name: c.name, value: c.value })),
      adminAuth: adminAuth ? adminAuth.value : 'not set',
      userEmail: userEmail ? userEmail.value : 'not set',
      userRole: userRole ? userRole.value : 'not set',
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to read cookies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
