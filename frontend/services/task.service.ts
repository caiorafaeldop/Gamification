import api from './api';
import { Task } from '../types';

export const getMyTasks = async () => {
    const response = await api.get('/tasks/my-tasks');
    return response.data;
};

export const getTasks = async (projectId: string) => {
  // Use kanban as the main way to get tasks for now, as there isn't a flat list endpoint yet
  const response = await api.get(`/tasks/project/${projectId}/kanban`);
  return response.data;
};

export const getProjectKanban = async (projectId: string) => {
    const response = await api.get(`/kanban/projects/${projectId}`);
    return response.data;
};

export const createTask = async (data: any) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const response = await api.patch(`/kanban/tasks/${taskId}/move`, { status }); // Using PATCH and simplified body
  return response.data;
};

export const deleteTask = async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
};

