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

export const getLeaderboard = async (period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all') => {
  // Backend currently exposes /leaderboard (global) and could support params
  // Assuming default controller setup: router.get('/', ...), router.get('/weekly', ...) etc.
  // Or router.get('/', controller.getGlobal)
  
  // For now, mapping 'all' to root /, others might need specific endpoints if backend implements them distinctively.
  // My K-P work verified basic leaderboard service. 
  // Let's assume query param is the way to go forward, or separate paths.
  // Based on my backend work (leaderboard.routes.ts which I should have double checked), 
  // typical pattern was likely /leaderboard/global, /leaderboard/team/:id, etc.
  
  // Checking typical implementation:
  // If period === 'weekly' -> /leaderboard/weekly
  // If period === 'team' -> /leaderboard/team/:id (not handled here generally)
  
  let url = '/leaderboard/global';
  if (period === 'weekly') {
      url = '/leaderboard/weekly';
  }
  
  const response = await api.get(url);
  return response.data;
};

export const getProjectLeaderboard = async (projectId: string) => {
    const response = await api.get(`/leaderboard/project/${projectId}`);
    return response.data;
};
