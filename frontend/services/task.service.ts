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
  const response = await api.get(`/kanban/projects/${projectId}`);
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

export const updateTask = async (id: string, data: any) => {
  const response = await api.patch(`/tasks/${id}`, data);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, columnId: string) => {
  const response = await api.patch(`/kanban/tasks/${taskId}/move`, { columnId });
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Column Management
export const createColumn = async (projectId: string, title: string, order: number, color?: string) => {
  const response = await api.post('/kanban/columns', { projectId, title, order, color });
  return response.data;
};

export const updateColumn = async (columnId: string, data: { title?: string, order?: number, status?: string, color?: string }) => {
  const response = await api.put(`/kanban/columns/${columnId}`, data);
  return response.data;
};

export const deleteColumn = async (columnId: string) => {
  const response = await api.delete(`/kanban/columns/${columnId}`);
  return response.data;
};

export const reorderColumns = async (projectId: string, columnIds: string[]) => {
  const response = await api.post('/kanban/columns/reorder', { projectId, columnIds });
  return response.data;
};

// Criação rápida de task com apenas título (estilo Trello)
export const createQuickTask = async (projectId: string, columnId: string, title: string) => {
  const response = await api.post('/tasks', {
    projectId,
    columnId,
    title,
    difficulty: 2, // Default: média
  });
  return response.data;
};

// Adicionar/remover responsáveis
export const addTaskAssignee = async (taskId: string, userId: string) => {
  const response = await api.post(`/tasks/${taskId}/assignees`, { userId });
  return response.data;
};

export const removeTaskAssignee = async (taskId: string, userId: string) => {
  const response = await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  return response.data;
};
