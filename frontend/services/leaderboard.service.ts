import api from './api';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarColor?: string;
  avatarUrl?: string;
  connectaPoints: number;
  rank?: number;
  tier?: {
    name: string;
  }
}

export const getLeaderboard = async (
  period: string = 'all',
  limit: number = 100,
  projectIds: string[] = []
) => {
  // Map 'week' (from UI filter) to 'weekly' (backend expectation)
  const backendPeriod = period === 'week' ? 'weekly' : period;

  const params = new URLSearchParams({
    period: backendPeriod,
    limit: String(limit),
  });

  if (projectIds.length > 0) {
    params.set('projectIds', projectIds.join(','));
  }

  const response = await api.get(`/leaderboard?${params.toString()}`);
  return response.data.users ? response.data.users : response.data;
};

export const getProjectLeaderboard = async (projectId: string) => {
  const response = await api.get(`/leaderboard/project/${projectId}`);
  return response.data;
};
