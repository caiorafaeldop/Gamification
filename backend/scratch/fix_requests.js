
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingRequests() {
  try {
    const projectId = 'd8207e21-b75b-4bcd-b58c-61e05f8ac325';
    const users = ['lara', 'yuricm06@gmail.com'];
    
    for (const identifier of users) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { name: identifier }
          ]
        }
      });
      
      if (user) {
        console.log(`Fixing for user: ${user.name} (${user.id})`);
        const existing = await prisma.projectJoinRequest.findUnique({
          where: { userId_projectId: { userId: user.id, projectId } }
        });
        
        if (!existing) {
          await prisma.projectJoinRequest.create({
            data: { userId: user.id, projectId }
          });
          console.log(`Created ProjectJoinRequest for ${user.name}`);
        } else {
          console.log(`ProjectJoinRequest already exists for ${user.name}`);
        }
      } else {
        console.log(`User not found: ${identifier}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingRequests();
