import api from './api';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarColor?: string;
  connectaPoints: number;
  rank?: number;
  tier?: {
      name: string;
  }
}

export const getLeaderboard = async (period: string = 'all', limit: number = 100) => {
  let url = '/leaderboard/global';
  if (period === 'weekly') {
      url = '/leaderboard/weekly';
  }
  
  const response = await api.get(`${url}?limit=${limit}`);
  return response.data.users ? response.data.users : response.data; 
};

export const getProjectLeaderboard = async (projectId: string) => {
    const response = await api.get(`/leaderboard/project/${projectId}`);
    return response.data;
};
