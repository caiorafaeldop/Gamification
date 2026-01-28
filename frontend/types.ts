export type ProjectStatus = 'active' | 'completed' | 'archived' | 'planning';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  type?: string;
  coverUrl?: string;
  progress: number;
  xpReward: number;
  status: ProjectStatus;
  members: number;
  color: string;
  leaderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-200 text-gray-600',
  planning: 'bg-amber-100 text-amber-700'
};

export const statusLabels: Record<ProjectStatus, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  archived: 'Arquivado',
  planning: 'Planejamento'
};


export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'LEADER' | 'MEMBER';
  FamenePoints: number;
  tierId: string;
  avatarColor?: string;
  course?: string;
  streakCurrent: number;
  streakBest: number;
}

export interface Tier {
  id: string;
  name: string;
  minPoints: number;
  order: number;
  icon?: string;
}

export interface Achievement {
  id: string;
  name: string; // Changed from title to match backend
  description: string;
  points: number;
  color?: string;
  icon?: string;
  criteria?: string;
  unlocked?: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement: Achievement;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done'; // Changed in-progress to match backend enum often
  difficulty: number;
  pointsReward: number;
  projectId: string;
  assignedToId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarColor?: string;
  points: number;
  rank: number;
  course?: string; // Optional context
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}

export enum AssigneeType {
  IMPLEMENTER = 'IMPLEMENTER',
  REVIEWER = 'REVIEWER',
  CREATOR = 'CREATOR'
}
export type GetAdminLogsParams = {
  page?: number;
  limit?: number;
  date?: string;
  search?: string;
  all?: boolean;
};

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
};
