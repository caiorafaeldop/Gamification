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
export const COLUMN_COLORS = {
  DEFAULT: { name: 'Padrão', bg: 'bg-gray-50/50 dark:bg-surface-dark/30', border: 'border-gray-200/50 dark:border-gray-800/50', text: 'text-gray-700 dark:text-gray-200', badge: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300', decoration: '' },
  BLUE: { name: 'Azul', bg: 'bg-secondary/20 dark:bg-secondary/40', border: 'border-secondary/20 dark:border-secondary/30', text: 'text-secondary dark:text-gray-200', badge: 'bg-secondary/10 dark:bg-secondary/30 text-secondary dark:text-gray-300', decoration: 'border-t-4 border-t-secondary' },
  RED: { name: 'Vermelho', bg: 'bg-red-200/80 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-800/30', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', decoration: 'border-t-4 border-t-red-500' },
  PURPLE: { name: 'Roxo', bg: 'bg-purple-200/80 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-800/30', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', decoration: 'border-t-4 border-t-purple-500' },
  AMBER: { name: 'Âmbar', bg: 'bg-amber-200/80 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-800/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', decoration: 'border-t-4 border-t-amber-500' },
  GREEN: { name: 'Verde', bg: 'bg-emerald-200/80 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-800/30', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', decoration: 'border-t-4 border-t-emerald-500' },
  PINK: { name: 'Rosa', bg: 'bg-pink-200/80 dark:bg-pink-900/40', border: 'border-pink-200 dark:border-pink-800/30', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400', decoration: 'border-t-4 border-t-pink-500' },
  INDIGO: { name: 'Índigo', bg: 'bg-indigo-200/80 dark:bg-indigo-900/40', border: 'border-indigo-200 dark:border-indigo-800/30', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', decoration: 'border-t-4 border-t-indigo-500' },
  CYAN: { name: 'Ciano', bg: 'bg-cyan-200/80 dark:bg-cyan-900/40', border: 'border-cyan-200 dark:border-cyan-800/30', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400', decoration: 'border-t-4 border-t-cyan-500' },
  TEAL: { name: 'Teal', bg: 'bg-teal-200/80 dark:bg-teal-900/40', border: 'border-teal-200 dark:border-teal-800/30', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', decoration: 'border-t-4 border-t-teal-500' },
  ORANGE: { name: 'Laranja', bg: 'bg-orange-200/80 dark:bg-orange-900/40', border: 'border-orange-200 dark:border-orange-800/30', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', decoration: 'border-t-4 border-t-orange-500' },
  LIME: { name: 'Lima', bg: 'bg-lime-200/80 dark:bg-lime-900/40', border: 'border-lime-200 dark:border-lime-800/30', text: 'text-lime-700 dark:text-lime-300', badge: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400', decoration: 'border-t-4 border-t-lime-500' },
  ROSE: { name: 'Rose', bg: 'bg-rose-200/80 dark:bg-rose-900/40', border: 'border-rose-200 dark:border-rose-800/30', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', decoration: 'border-t-4 border-t-rose-500' },
  SLATE: { name: 'Slate', bg: 'bg-slate-200/80 dark:bg-slate-900/40', border: 'border-slate-200 dark:border-slate-800/30', text: 'text-slate-700 dark:text-slate-300', badge: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400', decoration: 'border-t-4 border-t-slate-500' },
};
