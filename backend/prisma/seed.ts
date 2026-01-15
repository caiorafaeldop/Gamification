import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  //Comentei isso tudo para evitar de apagar o banco de dados toda vez que atualizassem ele

  // Clean up existing data (Comentado para não apagar seu banco)
  // await prisma.notification.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.userAchievement.deleteMany();
  // await prisma.activityLog.deleteMany();
  // await prisma.task.deleteMany();
  // await prisma.projectMember.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.achievement.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.tier.deleteMany();

  console.log('🧹 Cleaned up existing data.');

  // Create Tiers
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

  const bronzeTier = await prisma.tier.findUnique({ where: { name: 'Bronze' } });
  if (!bronzeTier) throw new Error('Bronze tier not found');

  // Create Users
  const passwordHash = await bcrypt.hash('123456', 10);

  const caioPasswordHash = await bcrypt.hash('12345678', 10);
  const usersData = [
    {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@connecta.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
      connectaPoints: 100,
      course: 'Management',
      avatarColor: '#FF5733',
      tierId: bronzeTier.id,
    },
    {
      email: 'leader@connecta.com',
      name: 'Project Leader',
      passwordHash,
      role: Role.LEADER,
      connectaPoints: 500,
      course: 'Engineering',
      avatarColor: '#33FF57',
      tierId: bronzeTier.id,
    },
    {
      email: 'student1@connecta.com',
      name: 'Alice Student',
      passwordHash,
      role: Role.MEMBER,
      connectaPoints: 200,
      course: 'Design',
      avatarColor: '#3357FF',
      tierId: bronzeTier.id,
    },
    {
      email: 'student2@connecta.com',
      name: 'Bob Student',
      passwordHash,
      role: Role.MEMBER,
      connectaPoints: 150,
      course: 'Computer Science',
      avatarColor: '#F333FF',
      tierId: bronzeTier.id,
    },
    {
      email: 'caio@gmail.com',
      name: 'Caio User',
      passwordHash: caioPasswordHash,
      role: Role.ADMIN,
      connectaPoints: 1000,
      course: 'Fullstack Dev',
      avatarColor: '#000000',
      tierId: bronzeTier.id,
    },
    {
  });

  const requestedAdmin = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin Requested',
      passwordHash: caioPasswordHash,
      role: Role.ADMIN,
      connectaPoints: 9999,
      course: 'System Admin',
      avatarColor: '#FF0000',
      tierId: bronzeTier.id,
    }
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@connecta.com' } }) as any;
  const leader = await prisma.user.findUnique({ where: { email: 'leader@connecta.com' } }) as any;
  const student1 = await prisma.user.findUnique({ where: { email: 'student1@connecta.com' } }) as any;
  const student2 = await prisma.user.findUnique({ where: { email: 'student2@connecta.com' } }) as any;

  console.log('👥 Users created.');

  // Create Projects
  // Create Projects
  const project1Data = {
    title: 'Project Alpha',
    description: 'Developing the next gen AI.',
    category: 'AI Research',
    leaderId: leader.id,
    color: '#FFD700',
    status: 'active',
    xpReward: 500,
    progress: 25,
  };

  const project1 = await prisma.project.upsert({
    where: { title: project1Data.title },
    update: project1Data,
    create: {
      ...project1Data,
      members: {
        create: [
          { userId: leader.id },
          { userId: student1.id },
        ],
      },
    }
  });

  const project2Data = {
    title: 'Project Beta',
    description: 'Redesigning the campus website.',
    category: 'Web Development',
    leaderId: admin.id, // Admin can also lead
    color: '#00D7FF',
    status: 'active',
    xpReward: 300,
    progress: 0,
  };

  const project2 = await prisma.project.upsert({
    where: { title: project2Data.title },
    update: project2Data,
    create: {
      ...project2Data,
      members: {
        create: [
          { userId: admin.id },
          { userId: student2.id },
        ],
      },
    }
  });

  console.log('🚀 Projects created.');

  // Create Tasks
  const tasksData = [
    {
      title: 'Setup Environment',
      description: 'Install Node.js and dependencies.',
      status: TaskStatus.done,
      difficulty: 2,
      pointsReward: 10,
      estimatedTimeMinutes: 30,
      projectId: project1.id as string,
      createdById: leader.id as string,
      assignedToId: student1.id as string,
      completedAt: new Date(),
    },
    {
      title: 'Design DB Schema',
      description: 'Create ERD.',
      status: TaskStatus.in_progress,
      difficulty: 5,
      pointsReward: 50,
      estimatedTimeMinutes: 120,
      projectId: project1.id as string,
      createdById: leader.id as string,
      assignedToId: student1.id as string,
    },
    {
      title: 'Write Documentation',
      description: 'Document the API.',
      status: TaskStatus.todo,
      difficulty: 3,
      pointsReward: 30,
      estimatedTimeMinutes: 60,
      projectId: project1.id as string,
      createdById: leader.id as string,
    }
  ];

  for (const task of tasksData) {
    const existingTask = await prisma.task.findFirst({
      where: { title: task.title, projectId: task.projectId }
    });
    if (!existingTask) {
      await prisma.task.create({ data: task });
    }
  }

  console.log('📝 Tasks created.');

  // Create Achievements
  // Create Achievements
  // Create Achievements using upsert for safety
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
    },
  ];

  for (const achievement of achievementsData) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  await prisma.achievement.createMany({
    data: [
      {
        name: 'Bem-vindo a bordo',
        description: 'Complete seu cadastro inicial e configure seu perfil de estudante.',
        points: 50,
        icon: 'rocket_launch',
        color: 'from-blue-400 to-primary',
        criteria: 'profile_completed'
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
      },
    ],
  });

  console.log('🏅 Achievements created.');

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