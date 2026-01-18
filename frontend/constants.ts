import { Project, LeaderboardEntry, Achievement, Task } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Plataforma E-learning',
    description: 'Desenvolvimento do módulo de gamificação para ensino à distância.',
    category: 'Dev',
    progress: 75,
    xpReward: 1500,
    status: 'active',
    members: 5,
    color: 'green'
  },
  {
    id: '2',
    title: 'Divulgação Hackathon',
    description: 'Criação de identidade visual e posts para redes sociais do evento.',
    category: 'Design',
    progress: 30,
    xpReward: 800,
    status: 'planning',
    members: 3,
    color: 'sky'
  },
  {
    id: '3',
    title: 'Monitoria Python',
    description: 'Ajude novos alunos a dominar bibliotecas como Pandas e NumPy.',
    category: 'Ensino',
    progress: 0,
    xpReward: 500,
    status: 'active',
    members: 2,
    color: 'blue'
  }
];

export const TOP_STUDENTS: LeaderboardEntry[] = [
  { userId: '1', name: 'Mariana Costa', course: 'Computação', points: 2450, rank: 1 },
  { userId: '2', name: 'Carlos Mendes', course: 'Eng. Software', points: 2150, rank: 2 },
  { userId: '3', name: 'João Silva', course: 'Ciência de Dados', points: 1980, rank: 3 },
  { userId: '4', name: 'Ana Clara', course: 'Ciência de Dados', points: 1800, rank: 4 },
  { userId: '5', name: 'Pedro H.', course: 'Eng. Software', points: 1750, rank: 5 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'Bem-vindo a bordo', description: 'Complete seu cadastro inicial.', icon: 'Rocket', points: 100, criteria: 'cadastro' },
  { id: '2', name: 'Primeira Classe', description: 'Receba a nota máxima em um projeto.', icon: 'Award', points: 500 },
  { id: '3', name: 'Networker', description: 'Participe de 3 projetos simultâneos.', icon: 'Users', points: 300 },
  { id: '4', name: 'Bug Hunter', description: 'Resolva 10 issues críticas.', icon: 'Bug', points: 1000 },
  
  // 🪙 Milestones
  { id: 'xp_1', name: 'Iniciante Dedicado', description: 'Atingir 100 de 🪙', icon: 'Zap', points: 0, criteria: 'xp_100' },
  { id: 'xp_2', name: 'Ganhando Tração', description: 'Atingir 200 de 🪙', icon: 'Zap', points: 0, criteria: 'xp_200' },
  { id: 'xp_3', name: 'Veterano', description: 'Atingir 500 de 🪙', icon: 'Award', points: 0, criteria: 'xp_500' },
  { id: 'xp_4', name: 'Mestre', description: 'Atingir 1000 de 🪙', icon: 'Award', points: 0, criteria: 'xp_1000' },
  { id: 'xp_5', name: 'Lenda', description: 'Atingir 2000 de 🪙', icon: 'Award', points: 0, criteria: 'xp_2000' },
];

export const KANBAN_TASKS: Task[] = [
  { id: '1', title: 'Definir personas', status: 'todo', difficulty: 1, pointsReward: 100, projectId: '1' },
  { id: '2', title: 'Criar wireframes', status: 'todo', difficulty: 2, pointsReward: 200, projectId: '1' },
  { id: '3', title: 'Implementar Drag & Drop', status: 'in_progress', difficulty: 3, pointsReward: 300, projectId: '1' },
  { id: '4', title: 'Configurar CI/CD', status: 'done', difficulty: 2, pointsReward: 200, projectId: '1' },
];