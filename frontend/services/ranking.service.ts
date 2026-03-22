import api from './api';

export interface RankingArt {
  id?: string;
  type: 'instagram' | 'linkedin';
  imageUrl: string;
  text: string;
}

export const getRankingArts = async (): Promise<RankingArt[]> => {
  try {
    const response = await api.get('/ranking/arts');
    return response.data;
  } catch (error) {
    console.error('Error fetching ranking arts:', error);
    return [];
  }
};
