// src/templates/prismaSeedTemplate.ts

export function generatePrismaSeedTemplate(): string {
  return `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  })

  console.log('✅ Created user:', user.email)

  // Add more seeding logic here
  // Example:
  // const posts = await prisma.post.createMany({
  //   data: [
  //     { title: 'First Post', content: 'Hello World!', authorId: user.id },
  //     { title: 'Second Post', content: 'Another post', authorId: user.id },
  //   ],
  // })

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`;
}
