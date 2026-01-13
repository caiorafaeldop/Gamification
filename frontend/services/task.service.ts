import api from './api';
import { Task } from '../types';

export const getMyTasks = async () => {
  const response = await api.get('/tasks/my-tasks');
  return response.data;
};

export const getTask = async (id: string) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const getTasks = async (projectId: string) => {
  // Use kanban as the main way to get tasks for now, as there isn't a flat list endpoint yet
  const response = await api.get(`/tasks/project/${projectId}/kanban`);
  return response.data;
};

export const getProjectKanban = async (projectId: string) => {
  const response = await api.get(`/tasks/project/${projectId}/kanban`);
  return response.data;
};

export const createTask = async (data: any) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: any) => {
  const response = await api.patch(`/tasks/${id}`, data);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  const response = await api.post(`/tasks/${taskId}/move`, { newStatus }); // Correction: Endpoint is POST /move, body is { newStatus }
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
