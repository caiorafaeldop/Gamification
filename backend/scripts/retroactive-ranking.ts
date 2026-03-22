const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function calculateRanking(startDateStr: string, endDateStr: string, weekNumber: number, yearNumber: number) {
  const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
  const endDate = new Date(`${endDateStr}T23:59:59.999Z`);

  console.log(`\n========================================`);
  console.log(`Calculating Ranking for Week ${weekNumber} (${startDateStr} to ${endDateStr})`);

  // Group by userId and sum pointsChange
  const activities = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      pointsChange: {
        gt: 0
      }
    },
    _sum: {
      pointsChange: true,
    },
    orderBy: {
      _sum: {
        pointsChange: 'desc'
      }
    },
    take: 3
  });

  if (activities.length === 0) {
    console.log('No activities found for this period.');
    return;
  }

  // Se já existir, a gente deleta para rodar de novo (idempotente)
  await prisma.weeklyRanking.deleteMany({
    where: { week: weekNumber, year: yearNumber }
  });

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    const user = await prisma.user.findUnique({ where: { id: activity.userId }});
    
    if (user) {
      await prisma.weeklyRanking.create({
        data: {
          userId: user.id,
          position: i + 1,
          week: weekNumber,
          year: yearNumber,
          points: activity._sum.pointsChange || 0,
          isPostGenerated: false
        }
      });
      console.log(`#${i + 1} - ${user.name} with ${activity._sum.pointsChange} points`);
    }
  }
}

async function run() {
  try {
    // Semanas de Março 2026:
    // A logica aqui usa dias manuais de acordo com o pedido
    // Março 1-7 foi a 9ª semana do ano
    await calculateRanking('2026-03-01', '2026-03-07', 9, 2026);
    // Março 8-14 foi a 10ª semana
    await calculateRanking('2026-03-08', '2026-03-14', 10, 2026);
    // Março 15-21 foi a 11ª semana
    await calculateRanking('2026-03-15', '2026-03-21', 11, 2026);

    console.log('\n✅ Retroactive Ranking generation completed!');
  } catch (error) {
    console.error('Error calculating retroactive ranking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
