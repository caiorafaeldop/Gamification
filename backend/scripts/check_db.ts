
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {


    // Check for the specific task column first
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Task' AND column_name = 'startDate';
    `);
    console.log('Task.startDate exists:', columns);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
