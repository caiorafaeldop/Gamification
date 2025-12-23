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
  progress: number;
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

export const joinProject = async (projectId: string) => {
  const response = await api.post(`/projects/${projectId}/join`);
  return response.data;
};
