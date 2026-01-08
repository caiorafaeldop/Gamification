import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding XP Achievements...');

  const achievements = [
    { name: 'Iniciante Dedicado', description: 'Atingir 100 de XP.', points: 50, icon: 'Zap', color: 'from-yellow-400 to-orange-500', criteria: 'points 100' },
    { name: 'Guerreiro da Jornada', description: 'Atingir 200 de XP.', points: 100, icon: 'Sword', color: 'from-orange-400 to-red-500', criteria: 'points 200' },
    { name: 'Mestre em Ascensão', description: 'Atingir 500 de XP.', points: 200, icon: 'Crown', color: 'from-purple-400 to-pink-500', criteria: 'points 500' },
    { name: 'Lenda do Connecta', description: 'Atingir 1000 de XP.', points: 500, icon: 'Star', color: 'from-blue-400 to-indigo-500', criteria: 'points 1000' },
  ];

  for (const ach of achievements) {
    const existing = await prisma.achievement.findUnique({
      where: { name: ach.name },
    });

    if (!existing) {
      await prisma.achievement.create({
        data: ach,
      });
      console.log(`✅ Created achievement: ${ach.name}`);
    } else {
        await prisma.achievement.update({
            where: { id: existing.id },
            data: ach
        });
        console.log(`🔄 Updated achievement: ${ach.name}`);
    }
  }

  console.log('✅ XP Achievements seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
