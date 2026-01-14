import api from './api';

export const getProjectBoard = async (projectId: string) => {
    const response = await api.get(`/kanban/projects/${projectId}`);
    return response.data; // Returns { board: { colId: tasks[] }, columns: [] }
};

export const createColumn = async (projectId: string, title: string) => {
    const response = await api.post(`/kanban/projects/${projectId}/columns`, { title });
    return response.data;
};

export const updateColumn = async (columnId: string, data: { title?: string; order?: number; status?: string }) => {
    const response = await api.patch(`/kanban/columns/${columnId}`, data);
    return response.data;
};

export const deleteColumn = async (columnId: string) => {
    const response = await api.delete(`/kanban/columns/${columnId}`);
    return response.data;
};

export const moveTask = async (taskId: string, columnId: string) => {
    const response = await api.patch(`/kanban/tasks/${taskId}/move`, { columnId });
    return response.data;
};

export const reorderColumns = async (projectId: string, columnIds: string[]) => {
    const response = await api.patch(`/kanban/projects/${projectId}/columns/reorder`, { columnIds });
    return response.data;
};
