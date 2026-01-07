import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};
