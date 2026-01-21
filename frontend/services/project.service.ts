import api from './api';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  color?: string;
  coverUrl?: string;
  progress: number;
  pointsPerOpenTask?: number;
  pointsPerCompletedTask?: number;
}

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectDetails = async (id: string) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const uploadProjectCover = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/projects/upload-cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Expected { url: string }
};

export const joinProject = async (projectId: string) => {
  const response = await api.post(`/projects/${projectId}/join`);
  return response.data;
};
export const updateProject = async (id: string, data: Partial<Project>) => {
  const response = await api.patch(`/projects/${id}`, data);
  return response.data;
};

export const leaveProject = async (projectId: string) => {
  const response = await api.delete(`/projects/${projectId}/leave`);
  return response.data;
};
