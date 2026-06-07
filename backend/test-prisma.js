import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const speakers = await prisma.speaker.findMany()
    console.log(speakers)
  } catch (error) {
    console.error('PRISMA ERROR:', error)
  } finally {
    await prisma.$disconnect()
  }
}
main()
