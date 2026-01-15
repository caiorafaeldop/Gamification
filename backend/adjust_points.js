
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        orderBy: { connectaPoints: 'desc' },
        select: { name: true, connectaPoints: true, id: true }
    });

    console.log('Leaderboard:');
    users.slice(0, 5).forEach((u, i) => console.log(`${i + 1}. ${u.name}: ${u.connectaPoints}`));

    const targetUser = users.find(u => u.name.toLowerCase().includes('hmm ye'));
    if (targetUser) {
        console.log(`\nFound target user: ${targetUser.name} (ID: ${targetUser.id}) with ${targetUser.connectaPoints} points.`);

        // Calculate points to be in top 3
        // Top 3 is at index 2
        const thirdPlacePoints = users[2] ? users[2].connectaPoints : 0;
        const pointsNeeded = thirdPlacePoints + 100 - targetUser.connectaPoints;

        if (pointsNeeded > 0) {
            console.log(`Adding ${pointsNeeded} points to reach top 3.`);
            await prisma.user.update({
                where: { id: targetUser.id },
                data: { connectaPoints: targetUser.connectaPoints + pointsNeeded }
            });
            console.log('Points updated successfully.');
        } else {
            console.log('User is already in top 3.');
        }
    } else {
        console.log('\nUser "hmm ye" not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
