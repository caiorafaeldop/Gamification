const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true }
    });
    users.forEach(u => console.log(u.email));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
