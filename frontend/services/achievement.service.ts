import api from './api';
import { Achievement, UserAchievement } from '../types';

export const getAchievements = async (): Promise<Achievement[]> => {
  const response = await api.get('/achievements');
  return response.data;
};

export const getMyAchievements = async (): Promise<UserAchievement[]> => {
  const response = await api.get('/achievements/me');
  // Backend returns paginated response { achievements: [], ... }
  return response.data.achievements || [];
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const response = await api.get(`/achievements/user/${userId}`);
  return response.data.achievements || [];
};

export const getAchievement = async (id: string): Promise<Achievement> => {
  const response = await api.get(`/achievements/${id}`);
  return response.data;
};
