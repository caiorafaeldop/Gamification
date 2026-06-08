import api from './api';
import { Tier } from '../types';

export const getTiers = async (): Promise<Tier[]> => {
  const response = await api.get('/tiers');
  return response.data;
};

export const getTier = async (id: string): Promise<Tier> => {
  const response = await api.get(`/tiers/${id}`);
  return response.data;
};
