import api from './api';

// --- PROJECTS ---

export const getAdminProjects = async () => {
  const response = await api.get('/admin/projects');
  return response.data;
};

export const updateProject = async (projectId: string, data: any) => {
  const response = await api.put(`/admin/projects/${projectId}`, data);
  return response.data;
};

// --- USERS ---

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserPoints = async (userId: string, points: number) => {
  const response = await api.patch(`/admin/users/${userId}/points`, { points });
  return response.data;
};

// --- LOGS ---

export const getAdminLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data;
};
