import api from './api';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarColor?: string;
  avatarUrl?: string;
  famenePoints: number;
  rank?: number;
  tier?: {
    name: string;
  }
}

export const getLeaderboard = async (period: string = 'all', limit: number = 100) => {
  // Map 'week' (from UI filter) to 'weekly' (backend expectation)
  const backendPeriod = period === 'week' ? 'weekly' : period;

  const response = await api.get(`/leaderboard?period=${backendPeriod}&limit=${limit}`);
  return response.data.users ? response.data.users : response.data;
};

export const getProjectLeaderboard = async (projectId: string) => {
  const response = await api.get(`/leaderboard/project/${projectId}`);
  return response.data;
};
