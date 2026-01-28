import { PrismaClient, Role, AssigneeType, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with EXTENDED User base...');

  // ==============================================================================
  // 1. TIERS
  // ==============================================================================
  const tiersData = [
    { name: 'Bronze', minPoints: 0, order: 1 },
    { name: 'Silver', minPoints: 1000, order: 2 },
    { name: 'Gold', minPoints: 3000, order: 3 },
    { name: 'Platinum', minPoints: 6000, order: 4 },
    { name: 'Diamond', minPoints: 10000, order: 5 },
  ];

  for (const tier of tiersData) {
    await prisma.tier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier,
    });
  }
  console.log('🏆 Tiers created.');

  // ==============================================================================
  // 2. ADMIN USER
  // ==============================================================================
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('ciconectado', salt);
  
  const bronzeTier = await prisma.tier.findUnique({ where: { name: 'Bronze' } });
  
  let adminUser: any = null;

  if (bronzeTier) {
      adminUser = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: { role: Role.ADMIN },
        create: {
            name: 'Super Admin',
            email: 'admin@gmail.com',
            passwordHash: passwordHash,
            role: Role.ADMIN,
            tierId: bronzeTier.id,
            bio: 'Conta administrativa do sistema.',
            avatarColor: 'from-gray-900 to-black',
        },
      });
      console.log('🛡️ Admin user ready: admin@gmail.com');
  } else {
      console.error('❌ Cannot create admin: Bronze tier not found.');
      return; 
  }

  // ==============================================================================
  // 3. ACHIEVEMENTS
  // ==============================================================================
  // (Mantendo a mesma lista robusta de antes)
  const achievementsData = [
    { name: 'Bem-vindo a bordo', description: 'Complete seu cadastro.', points: 50, icon: 'rocket_launch', color: 'from-blue-400 to-primary', criteria: 'profile_completed' },
    { name: 'Primeiro projeto', description: 'Entre no primeiro projeto', points: 50, icon: 'rocket_launch', color: 'from-blue-400 to-primary', criteria: 'first_project' },
    { name: 'Mente Brilhante', description: '5 avaliações positivas consecutivas.', points: 300, icon: 'psychology', color: 'from-purple-400 to-purple-600', criteria: 'consecutive_likes >= 5' },
    { name: 'Lenda Viva', description: 'Complete 100 projetos com nota máxima.', points: 1000, icon: 'whatshot', color: 'from-red-500 to-orange-600', criteria: 'legendary_status' }
  ];

  for (const achievement of achievementsData) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  console.log('🏅 Achievements created.');

  // ==============================================================================
  // 4. USERS (MEMBERS) - LISTA EXPANDIDA
  // ==============================================================================
  const usersData = [
    // --- Originals ---
    {
      name: 'Alice Frontend',
      email: 'alice@example.com',
      role: Role.MEMBER,
      bio: 'Apaixonada por CSS e animações fluidas.',
      tierName: 'Gold',
      avatarColor: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Bob Backend',
      email: 'bob@example.com',
      role: Role.MEMBER,
      bio: 'Node.js, Docker e tudo que roda no servidor.',
      tierName: 'Silver',
      avatarColor: 'from-blue-500 to-cyan-500',
    },
    // --- New Additions ---
    {
      name: 'Carol Cloud',
      email: 'carol@example.com',
      role: Role.MEMBER,
      bio: 'Arquiteta de Soluções AWS. O céu é o limite.',
      tierName: 'Platinum',
      avatarColor: 'from-sky-400 to-indigo-500',
    },
    {
      name: 'Daniel Data',
      email: 'daniel@example.com',
      role: Role.MEMBER,
      bio: 'Cientista de Dados. Transformo números em insights.',
      tierName: 'Diamond',
      avatarColor: 'from-violet-600 to-purple-800',
    },
    {
      name: 'Eduardo Estagiário',
      email: 'edu@example.com',
      role: Role.MEMBER,
      bio: 'Aprendendo React e tomando muito café.',
      tierName: 'Bronze',
      avatarColor: 'from-yellow-400 to-orange-400',
    },
    {
      name: 'Fiona Figma',
      email: 'fiona@example.com',
      role: Role.MEMBER,
      bio: 'Designer UI/UX. Pixels perfeitos sempre.',
      tierName: 'Gold',
      avatarColor: 'from-fuchsia-500 to-pink-600',
    },
    {
      name: 'Gabriel Gamer',
      email: 'gabriel@example.com',
      role: Role.MEMBER,
      bio: 'Desenvolvedor Unity e Gamification Expert.',
      tierName: 'Silver',
      avatarColor: 'from-green-500 to-emerald-700',
    },
    {
      name: 'Helena HR',
      email: 'helena@example.com',
      role: Role.MEMBER,
      bio: 'Scrum Master e People Ops. Organizando o caos.',
      tierName: 'Platinum',
      avatarColor: 'from-red-400 to-rose-600',
    },
    {
      name: 'Igor Infra',
      email: 'igor@example.com',
      role: Role.MEMBER,
      bio: 'DevOps & SRE. Garantindo 99.9% de uptime.',
      tierName: 'Diamond',
      avatarColor: 'from-slate-600 to-slate-800',
    },
    {
      name: 'Julia Java',
      email: 'julia@example.com',
      role: Role.MEMBER,
      bio: 'Especialista em sistemas legados e Spring Boot.',
      tierName: 'Silver',
      avatarColor: 'from-orange-600 to-red-700',
    },
    {
      name: 'Kevin QA',
      email: 'kevin@example.com',
      role: Role.MEMBER,
      bio: 'Quality Assurance. Se tem bug, eu encontro.',
      tierName: 'Bronze',
      avatarColor: 'from-teal-400 to-teal-600',
    },
    {
      name: 'Lucas Leader',
      email: 'lucas@example.com',
      role: Role.MEMBER, // Poderia ser ADMIN, mas deixaremos MEMBER para testes
      bio: 'Tech Lead. Mentorando a próxima geração.',
      tierName: 'Diamond',
      avatarColor: 'from-amber-400 to-yellow-600',
    },
    {
      name: 'Maria Mobile',
      email: 'maria@example.com',
      role: Role.MEMBER,
      bio: 'Flutter & React Native. Mobile first.',
      tierName: 'Gold',
      avatarColor: 'from-cyan-400 to-blue-600',
    },
    {
      name: 'Nina Network',
      email: 'nina@example.com',
      role: Role.MEMBER,
      bio: 'Engenheira de Segurança e Redes.',
      tierName: 'Platinum',
      avatarColor: 'from-zinc-500 to-neutral-700',
    },
    {
      name: 'Otavio Ops',
      email: 'otavio@example.com',
      role: Role.MEMBER,
      bio: 'Automação e Scripts em Python.',
      tierName: 'Bronze',
      avatarColor: 'from-lime-500 to-green-600',
    }
  ];

  const createdUsers = [];

  for (const userData of usersData) {
     const userTier = await prisma.tier.findUnique({ where: { name: userData.tierName } });
     if (userTier) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: { 
                role: userData.role,
                bio: userData.bio, // Garantir update da bio
                tierId: userTier.id,
                avatarColor: userData.avatarColor
            },
            create: {
                name: userData.name,
                email: userData.email,
                passwordHash: passwordHash,
                role: userData.role,
                tierId: userTier.id,
                bio: userData.bio,
                avatarColor: userData.avatarColor,
            },
        });
        createdUsers.push(user);
     }
  }
  console.log(`👥 ${createdUsers.length} Users created/updated.`);

  // ==============================================================================
  // 5. PROJECTS & TASKS (Com distribuição melhorada de usuários)
  // ==============================================================================
  
  const allUsers = [adminUser, ...createdUsers];

  const projectsList = [
      {
          title: 'Gamification Platform',
          description: 'Sistema principal de gestão.',
          status: 'active',
          color: 'from-violet-600 to-indigo-600',
          xpReward: 500,
          tasks: [
            { title: 'Database Schema', status: TaskStatus.done, diff: 3, tags: ['backend'] },
            { title: 'Auth System', status: TaskStatus.in_progress, diff: 4, tags: ['security'] },
            { title: 'Frontend Dashboard', status: TaskStatus.todo, diff: 3, tags: ['react'] },
          ]
      },
      {
          title: 'EcoTrack Mobile',
          description: 'App de sustentabilidade.',
          status: 'active',
          color: 'from-green-500 to-emerald-700',
          xpReward: 800,
          tasks: [
            { title: 'UI Kit Figma', status: TaskStatus.done, diff: 2, tags: ['design'] },
            { title: 'Maps API', status: TaskStatus.in_progress, diff: 5, tags: ['api'] },
            { title: 'Unit Tests', status: TaskStatus.todo, diff: 3, tags: ['qa'] }
          ]
      },
      {
          title: 'NeuralViz AI',
          description: 'Dashboard de IA.',
          status: 'planning',
          color: 'from-fuchsia-600 to-purple-800',
          xpReward: 1200,
          tasks: [
            { title: 'Data Cleaning', status: TaskStatus.in_progress, diff: 4, tags: ['data'] },
            { title: 'Model Training', status: TaskStatus.todo, diff: 5, tags: ['ai'] }
          ]
      },
      {
          title: 'Marketing Site Q3',
          description: 'Landing Page Institucional.',
          status: 'completed',
          color: 'from-orange-500 to-red-600',
          xpReward: 300,
          tasks: [
            { title: 'SEO Audit', status: TaskStatus.done, diff: 2, tags: ['seo'] },
            { title: 'Copywriting', status: TaskStatus.done, diff: 1, tags: ['content'] }
          ]
      },
      // Novo Projeto Extra para comportar tantos usuários
      {
        title: 'Legacy Migration',
        description: 'Migração do monólito antigo para microsserviços.',
        status: 'active',
        color: 'from-slate-600 to-gray-800',
        xpReward: 2000,
        tasks: [
          { title: 'Audit Legacy Code', status: TaskStatus.in_progress, diff: 5, tags: ['legacy', 'java'] },
          { title: 'Setup Kubernetes', status: TaskStatus.todo, diff: 5, tags: ['devops'] },
          { title: 'Stress Testing', status: TaskStatus.todo, diff: 4, tags: ['qa'] }
        ]
    }
  ];

  for (const pData of projectsList) {
      // Sorteia um líder
      const randomLeader = allUsers[Math.floor(Math.random() * allUsers.length)];

      const project = await prisma.project.upsert({
          where: { title: pData.title },
          update: {},
          create: {
              title: pData.title,
              description: pData.description,
              leaderId: randomLeader.id,
              status: pData.status,
              color: pData.color,
              xpReward: pData.xpReward,
          }
      });
      console.log(`🚀 Project synced: ${pData.title}`);

      // Adiciona TODOS os usuários como membros para popular a UI
      for (const user of allUsers) {
          await prisma.projectMember.upsert({
              where: { userId_projectId: { userId: user.id, projectId: project.id } },
              update: {},
              create: { userId: user.id, projectId: project.id }
          });
      }

      // Cria Tarefas e define Responsáveis (Assignees)
      for (const tData of pData.tasks) {
          const existingTask = await prisma.task.findFirst({
              where: { title: tData.title, projectId: project.id }
          });

          if (!existingTask) {
              // Sorteia um criador da tarefa
              const creator = allUsers[Math.floor(Math.random() * allUsers.length)];

              const newTask = await prisma.task.create({
                  data: {
                      title: tData.title,
                      description: `Tarefa gerada automaticamente: ${tData.title}`,
                      status: tData.status,
                      pointsReward: 50 + (tData.diff * 10), // Pontos dinâmicos baseados na dificuldade
                      difficulty: tData.diff,
                      tags: tData.tags,
                      projectId: project.id,
                      createdById: creator.id,
                  }
              });

              // Associa o Criador
              await prisma.taskAssignee.create({
                  data: { taskId: newTask.id, userId: creator.id, type: AssigneeType.CREATOR }
              });

              // Sorteia Implementador
              const implementer = allUsers[Math.floor(Math.random() * allUsers.length)];
              await prisma.taskAssignee.create({
                  data: { taskId: newTask.id, userId: implementer.id, type: AssigneeType.IMPLEMENTER }
              });

              // Sorteia Reviewer (tenta ser diferente do implementer)
              let reviewer = allUsers[Math.floor(Math.random() * allUsers.length)];
              while (reviewer.id === implementer.id && allUsers.length > 1) {
                  reviewer = allUsers[Math.floor(Math.random() * allUsers.length)];
              }

              await prisma.taskAssignee.create({
                  data: { taskId: newTask.id, userId: reviewer.id, type: AssigneeType.REVIEWER }
              });
          }
      }
  }
  
  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
