export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  xpReward: number;
  status: 'active' | 'planning' | 'completed';
  members: number;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  course: string;
  points: number;
  rank: number;
  avatarColor?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name mapping
  unlocked: boolean;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}