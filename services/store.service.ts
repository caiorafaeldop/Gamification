import api from './api';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  image?: string;
  category?: string;
}

export const getStoreItems = async () => {
  const response = await api.get('/store/items');
  return response.data;
};

export const purchaseItem = async (itemId: string) => {
  const response = await api.post('/store/buy', { itemId });
  return response.data;
};
