import api from './api';

export interface RankingArt {
  id?: string;
  type: 'instagram' | 'linkedin';
  imageUrl: string;
  text: string;
}

export interface WeeklyWinner {
  position: number;
  points: number;
  user: {
    name: string;
    avatarUrl?: string;
    linkedinUrl?: string;
  };
}

export const getRankingArts = async (week?: number, year?: number): Promise<RankingArt[]> => {
  try {
    const params: Record<string, string> = {};
    if (week) params.week = String(week);
    if (year) params.year = String(year);
    
    const response = await api.get('/ranking/arts', { params });
    // Backend retorna { status: 'success', data: [...] }
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching ranking arts:', error);
    return [];
  }
};

export const getWeeklyRanking = async (week: number, year: number): Promise<WeeklyWinner[]> => {
  try {
    const response = await api.get(`/ranking/hall-of-fame?year=${year}`);
    if (response.data?.status === 'success') {
      const slots = response.data.data.hallOfFame;
      const weekSlot = slots.find((s: any) => s.week === week);
      if (weekSlot && weekSlot.winners) {
        return weekSlot.winners;
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching weekly ranking:', error);
    return [];
  }
};
