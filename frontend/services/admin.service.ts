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

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
};

export const getAdminUsers = async (params: GetAdminUsersParams) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};
export const updateUserPoints = async (userId: string, points: number) => {
  const response = await api.patch(`/admin/users/${userId}/points`, { points });
  return response.data;
};

// --- LOGS ---

export type GetAdminLogsParams = {
  page?: number;
  limit?: number;
  date?: string;
  search?: string;
  all?: boolean;
};

export const getAdminLogs = async (params: GetAdminLogsParams) => {
  const response = await api.get('/admin/logs', {
    params
  });

  return response.data;
};
