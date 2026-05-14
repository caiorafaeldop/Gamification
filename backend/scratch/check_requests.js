
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRequests() {
  try {
    const projectId = 'd8207e21-b75b-4bcd-b58c-61e05f8ac325';
    
    console.log(`Checking project: ${projectId}`);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { Group: true }
    });
    
    if (!project) {
      console.log('Project not found!');
      return;
    }
    
    console.log(`Project title: ${project.title}`);
    console.log(`Project group ID: ${project.groupId}`);
    console.log(`Project group name: ${project.Group?.name}`);
    console.log(`Project group isRestricted: ${project.Group?.isRestricted}`);

    const projectRequests = await prisma.projectJoinRequest.findMany({
      where: { projectId },
      include: { user: { select: { name: true, email: true } } }
    });
    
    console.log(`Found ${projectRequests.length} ProjectJoinRequests:`);
    projectRequests.forEach(r => {
      console.log(`- User: ${r.user.name} (${r.user.email}), Status: ${r.status}`);
    });

    if (project.groupId) {
      const groupRequests = await prisma.groupJoinRequest.findMany({
        where: { groupId: project.groupId },
        include: { user: { select: { name: true, email: true } } }
      });
      console.log(`Found ${groupRequests.length} GroupJoinRequests for this project's group:`);
      groupRequests.forEach(r => {
        console.log(`- User: ${r.user.name} (${r.user.email}), Status: ${r.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRequests();
