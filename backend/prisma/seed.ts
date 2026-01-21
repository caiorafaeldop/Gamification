import { PrismaClient, Role, AssigneeType, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- TIERS (Necessário manter pois User depende de TierId obrigatório) ---
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

  // --- ADMIN USER ---
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('ciconectado', salt);
  
  // Pegar o tier Bronze para associar ao admin (obrigatório pelo schema)
  const bronzeTier = await prisma.tier.findUnique({ where: { name: 'Bronze' } });
  
  if (bronzeTier) {
      await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {
            role: Role.ADMIN,
            // Se quiser resetar a senha sempre que rodar o seed, descomente:
            // passwordHash: passwordHash 
        },
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
  }

  // --- ACHIEVEMENTS (Apenas as conquistas, como solicitado) ---
  const achievementsData = [
    {
      name: 'Bem-vindo a bordo',
      description: 'Complete seu cadastro inicial e configure seu perfil de estudante.',
      points: 50,
      icon: 'rocket_launch',
      color: 'from-blue-400 to-primary',
      criteria: 'profile_completed'
    },
    {
      name: 'Primeiro projeto',
      description: 'Participe do seu primeiro projeto',
      points: 50,
      icon: 'rocket_launch',
      color: 'from-blue-400 to-primary',
      criteria: 'first_project'
    },
    {
      name: 'Primeira tarefa',
      description: 'Crie a primeira tarefa dentro de um projeto',
      points: 50,
      icon: 'pest_control',
      color: 'from-green-400 to-green-600',
      criteria: 'first_task'
    },
    {
      name: 'Primeira Classe',
      description: 'Receba a nota máxima no seu primeiro projeto colaborativo.',
      points: 200,
      icon: 'workspace_premium',
      color: 'from-yellow-300 to-gold',
      criteria: 'max_score_project'
    },
    {
      name: 'Super Produtivo',
      description: 'Atingir 1000 Connecta Points em uma única semana.',
      points: 150,
      icon: 'bolt',
      color: 'from-yellow-400 to-orange-500',
      criteria: 'weekly_points >= 1000'
    },
    {
      name: 'Mente Brilhante',
      description: 'Receba 5 avaliações positivas consecutivas de membros da equipe.',
      points: 300,
      icon: 'psychology',
      color: 'from-purple-400 to-purple-600',
      criteria: 'consecutive_likes >= 5'
    },
    {
      name: 'Líder Nato',
      description: 'Lidere uma equipe de 5 pessoas até a conclusão de um projeto.',
      points: 500,
      icon: 'groups',
      color: 'from-blue-600 to-indigo-700',
      criteria: 'lead_team >= 1'
    },
    {
      name: 'Bug Hunter',
      description: 'Encontre e reporte um bug na plataforma que seja validado.',
      points: 100,
      icon: 'pest_control',
      color: 'from-green-400 to-green-600',
      criteria: 'bug_report_validated'
    },
    {
      name: 'O Comunicador',
      description: 'Faça 50 comentários construtivos em projetos de colegas.',
      points: 120,
      icon: 'forum',
      color: 'from-pink-400 to-rose-500',
      criteria: 'comments_count >= 50'
    },
    {
      name: 'Lenda Viva',
      description: 'Complete 100 projetos com avaliação máxima.',
      points: 1000,
      icon: 'whatshot',
      color: 'from-red-500 to-orange-600',
      criteria: 'legendary_status'
    }
  ];

  for (const achievement of achievementsData) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log('🏅 Achievements created.');

  // --- USERS ---
  const usersData = [
    {
      name: 'Alice Developer',
      email: 'alice@example.com',
      role: Role.MEMBER,
      bio: 'Frontend Specialist',
      tierName: 'Bronze',
      avatarColor: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Bob Backend',
      email: 'bob@example.com',
      role: Role.MEMBER,
      bio: 'Backend Specialist',
      tierName: 'Silver',
      avatarColor: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Charlie Reviewer',
      email: 'charlie@example.com',
      role: Role.MEMBER,
      bio: 'QA & Reviewer',
      tierName: 'Gold',
      avatarColor: 'from-green-500 to-emerald-500',
    },
  ];

  const createdUsers = [];

  for (const userData of usersData) {
     const userTier = await prisma.tier.findUnique({ where: { name: userData.tierName } });
     if (userTier) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {
                role: userData.role,
            },
            create: {
                name: userData.name,
                email: userData.email,
                passwordHash: passwordHash, // reusing admin password for simplicity
                role: userData.role,
                tierId: userTier.id,
                bio: userData.bio,
                avatarColor: userData.avatarColor,
            },
        });
        createdUsers.push(user);
     }
  }
  console.log(`👥 ${createdUsers.length} Sample users created.`);

  // --- PROJECT ---
  // Need the admin user (leader)
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } });
  
  if (adminUser) {
    const project = await prisma.project.upsert({
        where: { title: 'Gamification Platform' },
        update: {},
        create: {
            title: 'Gamification Platform',
            description: 'Main project for the gamified task management system.',
            leaderId: adminUser.id,
            status: 'active',
            color: 'from-violet-600 to-indigo-600',
            xpReward: 500,
        }
    });
    console.log('🚀 Project created: Gamification Platform');

    // Add members to project
    for (const user of createdUsers) {
        await prisma.projectMember.upsert({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: project.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                projectId: project.id
            }
        });
    }
    console.log('🤝 Members added to project.');

    // --- TASKS ---
    const tasksData = [
        {
            title: 'Setup Database Schema',
            description: 'Define the initial Prisma schema and run migrations.',
            status: TaskStatus.done,
            pointsReward: 50,
            difficulty: 3,
            tags: ['backend', 'database'],
        },
        {
            title: 'Implement Authentication',
            description: 'Setup JWT auth and user login/register endpoints.',
            status: TaskStatus.in_progress,
            pointsReward: 80,
            difficulty: 4,
            tags: ['backend', 'security'],
        },
        {
            title: 'Design Dashboard UI',
            description: 'Create high-fidelity mockups for the main dashboard.',
            status: TaskStatus.todo,
            pointsReward: 60,
            difficulty: 3,
            tags: ['design', 'frontend'],
        }
    ];

    for (const taskData of tasksData) {
        const newTask = await prisma.task.create({
            data: {
                ...taskData,
                projectId: project.id,
                createdById: adminUser.id,
            }
        });

        // Assign random users as assignees
        if (createdUsers.length > 0) {
            // Assign Creator (Admin)
            await prisma.taskAssignee.create({
                data: {
                    taskId: newTask.id,
                    userId: adminUser.id,
                    type: AssigneeType.CREATOR
                }
            });

            // Assign Implementer (Random User)
            const implementer = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            await prisma.taskAssignee.create({
                data: {
                    taskId: newTask.id,
                    userId: implementer.id,
                    type: AssigneeType.IMPLEMENTER
                }
            });
             
             // Assign Reviewer (Another Random User or same)
             const reviewer = createdUsers[Math.floor(Math.random() * createdUsers.length)];
             // Ensure uniqueness if needed, but schema allows unique(taskId, userId, type). 
             // Logic in app might want unique users per role, but for seed we keep it simple.
             // Just avoiding partial constraint errors if we try to add same user/type pair twice.
             
             await prisma.taskAssignee.create({
                data: {
                    taskId: newTask.id,
                    userId: reviewer.id,
                    type: AssigneeType.REVIEWER
                }
            });
        }
    }
    console.log('✅ Tasks and Assignees created.');
  }
  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });