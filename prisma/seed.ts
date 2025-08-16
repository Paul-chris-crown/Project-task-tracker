import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

      // Create initial admin user
    const adminEmail = 'admin@example.com'
    
    try {
      // First, create the admin in AllowedUser table
      const existingAdmin = await prisma.allowedUser.findUnique({
        where: { email: adminEmail }
      })

      if (!existingAdmin) {
        await prisma.allowedUser.create({
          data: {
            email: adminEmail,
            role: 'ADMIN'
          }
        })
        console.log('✅ Created admin user in AllowedUser table:', adminEmail)
      } else {
        console.log('ℹ️  Admin user already exists in AllowedUser table:', adminEmail)
      }

      // Then, create the admin in User table
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: 'Admin User',
            email: adminEmail,
            role: 'ADMIN',
          }
        })
        console.log('✅ Created admin user in User table:', adminEmail)
      } else {
        console.log('ℹ️  Admin user already exists in User table:', adminEmail)
      }

    // Create a sample member user
    const memberEmail = 'member@example.com'
    const existingMember = await prisma.allowedUser.findUnique({
      where: { email: memberEmail }
    })

    if (!existingMember) {
      await prisma.allowedUser.create({
        data: {
          email: memberEmail,
          role: 'MEMBER'
        }
      })
      console.log('✅ Created member user in AllowedUser table:', memberEmail)
    } else {
      console.log('ℹ️  Member user already exists in AllowedUser table:', memberEmail)
    }

    // Create member in User table
    const existingMemberUser = await prisma.user.findUnique({
      where: { email: memberEmail }
    })

    if (!existingMemberUser) {
      await prisma.user.create({
        data: {
          name: 'Member User',
          email: memberEmail,
          role: 'MEMBER',
        }
      })
      console.log('✅ Created member user in User table:', memberEmail)
    } else {
      console.log('ℹ️  Member user already exists in User table:', memberEmail)
    }

    console.log('🎉 Database seeding completed!')
    console.log('📧 Admin email:', adminEmail)
    console.log('📧 Member email:', memberEmail)
    console.log('🔑 Use these emails to test the authentication system')
    console.log('🔑 Default password: admin123 (set in ADMIN_PASSWORD env var)')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
