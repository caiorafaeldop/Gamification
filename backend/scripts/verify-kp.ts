import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting verification...');

  try {
    // 1. Create User
    // 0. Create Tier
    const tier = await prisma.tier.upsert({
        where: { name: 'Bronze' },
        update: {},
        create: {
            name: 'Bronze',
            minPoints: 0,
            order: 1,
            icon: 'award'
        }
    });
    console.log('Tier ensured:', tier.id);

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        name: 'Test K-P User',
        email: `kp-test-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        connectaPoints: 500,
        tierId: tier.id,
      },
    });
    console.log('User created:', user.id);

    // 2. Create Project (Team)
    const project = await prisma.project.create({
      data: {
        title: `Project K-P ${Date.now()}`,
        leaderId: user.id,
        category: 'Development',
        status: 'active',
        members: {
            create: { userId: user.id }
        }
      },
    });
    console.log('Project created:', project.id);

    // 3. Create Task
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        status: TaskStatus.BACKLOG,
        difficulty: 1,
        pointsReward: 10,
        projectId: project.id,
        createdById: user.id,
        assignedToId: user.id,
      },
    });
    console.log('Task created:', task.id);

    // 4. Test Kanban: Move Task - emulating logic
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.IN_PROGRESS },
    });
    console.log('Task moved to:', updatedTask.status);

    // 5. Test Store: Create Item and Buy
    const item = await prisma.storeItem.create({
      data: {
        name: 'Test Item',
        description: 'A test store item',
        cost: 100,
      },
    });
    console.log('Store item created:', item.id);

    // Purchase Logic (Simplification of what controller does)
    const [updatedUser, order] = await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { connectaPoints: { decrement: item.cost } }
        }),
        prisma.order.create({
            data: { userId: user.id, itemId: item.id, cost: item.cost }
        })
    ]);
    console.log('Item purchased. New balance:', updatedUser.connectaPoints);

    // 6. Test Notifications
    const notification = await prisma.notification.create({
        data: {
            userId: user.id,
            title: 'Test Notification',
            message: 'You bought an item',
            type: 'info'
        }
    });
    console.log('Notification created:', notification.id);

    console.log('VERIFICATION SUCCESSFUL');

  } catch (error) {
    console.error('VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
