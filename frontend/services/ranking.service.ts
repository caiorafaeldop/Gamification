import api from './api';

export interface RankingArt {
  id?: string;
  type: 'instagram' | 'linkedin';
  imageUrl: string;
  text: string;
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
