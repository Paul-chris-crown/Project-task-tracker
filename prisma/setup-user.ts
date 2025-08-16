import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupUser() {
  // CHANGE THIS EMAIL TO YOUR DESIRED EMAIL
  const userEmail = 'adeofdefi@gmail.com'
  const userName = 'Adeofdefi'
  const userRole = 'ADMIN' // or 'MEMBER' if you prefer

  console.log('👤 Setting up user access...')
  console.log(`📧 Email: ${userEmail}`)
  console.log(`👤 Name: ${userName}`)
  console.log(`🔑 Role: ${userRole}`)

  try {
    // Add to AllowedUser table (required for login)
    const allowedUser = await prisma.allowedUser.create({
      data: {
        email: userEmail,
        role: userRole
      }
    })
    console.log('✅ Added to AllowedUser table')

    // Add to User table (for project/task ownership)
    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        role: userRole
      }
    })
    console.log('✅ Added to User table')

    console.log('🎉 User setup completed!')
    console.log(`🔑 You can now login with: ${userEmail}`)
    console.log(`🔑 Password: admin123 (or whatever you set in ADMIN_PASSWORD)`)
    
  } catch (error) {
    console.error('❌ Error setting up user:', error)
    throw error
  }
}

setupUser()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
