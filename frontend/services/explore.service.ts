import api from './api';

export interface ExploreProject {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  color: string | null;
  status: string;
  visibility: 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_LIKE' | null;
  isJoiningOpen: boolean | null;
  progress: number;
  leader: { id: string; name: string; avatarUrl?: string | null; avatarColor?: string | null };
  Group?: { id: string; name: string; color: string | null; logoUrl: string | null } | null;
  members: { userId: string }[];
  _count?: { members: number; tasks: number };
}

export const getExploreProjects = async (): Promise<ExploreProject[]> => {
  const { data } = await api.get('/projects/explore');
  return data;
};

export const registerProjectInterest = async (projectId: string) => {
  const { data } = await api.post(`/projects/${projectId}/interest`);
  return data;
};
