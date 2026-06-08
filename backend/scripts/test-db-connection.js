require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando teste de conexão...');
  console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL);

  try {
    console.log('Tentando conectar ao Prisma...');
    await prisma.$connect();
    console.log('✅ Conexão bem-sucedida!');

    console.log('Verificando usuário admin@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' },
    });

    if (user) {
      console.log('✅ Usuário admin@gmail.com ENCONTRADO.');
      console.log('ID:', user.id);
      console.log('Role:', user.role);
    } else {
      console.log('❌ Usuário admin@gmail.com NÃO encontrado.');
    }

  } catch (error) {
    console.error('❌ Erro ao conectar ou consultar o banco:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
