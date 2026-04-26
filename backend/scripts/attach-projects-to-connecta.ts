import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const connecta = await prisma.group.findFirst({
    where: { name: { equals: 'Connecta', mode: 'insensitive' } },
  });

  if (!connecta) {
    console.error('❌ Grupo "Connecta" não encontrado.');
    const all = await prisma.group.findMany({ select: { id: true, name: true } });
    console.log('Grupos disponíveis:', all);
    process.exit(1);
  }

  console.log(`✅ Connecta encontrado:`);
  console.log(`   id:    ${connecta.id}`);
  console.log(`   name:  ${connecta.name}`);
  console.log(`   color: ${connecta.color}`);

  const before = await prisma.project.count();
  const alreadyIn = await prisma.project.count({ where: { groupId: connecta.id } });
  const toUpdate = await prisma.project.count({
    where: { OR: [{ groupId: null }, { groupId: { not: connecta.id } }] },
  });

  console.log(`\n📊 Total de projetos:        ${before}`);
  console.log(`   Já no Connecta:           ${alreadyIn}`);
  console.log(`   Serão atribuídos agora:   ${toUpdate}`);

  const result = await prisma.project.updateMany({
    where: { OR: [{ groupId: null }, { groupId: { not: connecta.id } }] },
    data: { groupId: connecta.id },
  });

  console.log(`\n🎉 Projetos atualizados: ${result.count}`);

  const finalCount = await prisma.project.count({ where: { groupId: connecta.id } });
  console.log(`✔  Projetos no Connecta agora: ${finalCount}/${before}`);
}

run()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
