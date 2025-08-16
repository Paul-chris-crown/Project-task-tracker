import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Starting database cleanup...')

  try {
    // Delete all tasks first (due to foreign key constraints)
    const deletedTasks = await prisma.task.deleteMany()
    console.log(`🗑️  Deleted ${deletedTasks.count} tasks`)

    // Delete all projects
    const deletedProjects = await prisma.project.deleteMany()
    console.log(`🗑️  Deleted ${deletedProjects.count} projects`)

    // Delete all users
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`🗑️  Deleted ${deletedUsers.count} users`)

    // Delete all allowed users
    const deletedAllowedUsers = await prisma.allowedUser.deleteMany()
    console.log(`🗑️  Deleted ${deletedAllowedUsers.count} allowed users`)

    console.log('✨ Database cleanup completed!')
    console.log('📝 You can now add your own email to the AllowedUser table')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

cleanup()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
