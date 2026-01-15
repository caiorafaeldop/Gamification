import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Achievements ---');

    const users = await prisma.user.findMany({
        include: {
            userAchievements: {
                include: { achievement: true }
            }
        }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users as any[]) {
        console.log(`User: ${user.name} (${user.id})`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - Points: ${user.connectaPoints}`);
        console.log(`  - Unlocked Achievements (${user.userAchievements.length}):`);
        user.userAchievements.forEach((ua: any) => {
            console.log(`    * [${ua.achievement.id}] ${ua.achievement.name} (Earned: ${ua.earnedAt})`);
        });
    }

    const allAchievements = await prisma.achievement.findMany();
    console.log(`Total Achievements in DB: ${allAchievements.length}`);
    allAchievements.forEach(a => {
        console.log(`  - [${a.id}] ${a.name} (Criteria: ${a.criteria})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
