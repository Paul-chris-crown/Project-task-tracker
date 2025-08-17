import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Push the schema to the database
    console.log('Pushing schema to database...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    console.log('✅ Database schema updated successfully')
    
    // Create a test user if none exists
    const userCount = await prisma.user.count()
    if (userCount === 0) {
      console.log('Creating test user...')
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN',
        },
      })
      console.log('✅ Test user created')
    }
    
    console.log('✅ Database setup completed successfully')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
