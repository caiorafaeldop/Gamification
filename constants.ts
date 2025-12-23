import { Project, Student, Achievement, Task } from './types';

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

export const TOP_STUDENTS: Student[] = [
  { id: '1', name: 'Mariana Costa', course: 'Computação', points: 2450, rank: 1 },
  { id: '2', name: 'Carlos Mendes', course: 'Eng. Software', points: 2150, rank: 2 },
  { id: '3', name: 'João Silva', course: 'Ciência de Dados', points: 1980, rank: 3 },
  { id: '4', name: 'Ana Clara', course: 'Ciência de Dados', points: 1800, rank: 4 },
  { id: '5', name: 'Pedro H.', course: 'Eng. Software', points: 1750, rank: 5 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Bem-vindo a bordo', description: 'Complete seu cadastro inicial.', icon: 'Rocket', unlocked: true, color: 'from-sky-300 to-primary' },
  { id: '2', title: 'Primeira Classe', description: 'Receba a nota máxima em um projeto.', icon: 'Award', unlocked: true, color: 'from-yellow-300 to-yellow-500' },
  { id: '3', title: 'Networker', description: 'Participe de 3 projetos simultâneos.', icon: 'Users', unlocked: false, color: 'from-blue-300 to-blue-500' },
  { id: '4', title: 'Bug Hunter', description: 'Resolva 10 issues críticas.', icon: 'Bug', unlocked: false, color: 'from-red-300 to-red-500' },
];

export const KANBAN_TASKS: Task[] = [
  { id: '1', title: 'Definir personas', status: 'todo' },
  { id: '2', title: 'Criar wireframes', status: 'todo' },
  { id: '3', title: 'Implementar Drag & Drop', status: 'in-progress' },
  { id: '4', title: 'Configurar CI/CD', status: 'done' },
];