import api from './api';

export const getComments = async (taskId: string) => {
    const response = await api.get(`/comments/${taskId}`);
    return response.data;
};

export const createComment = async (taskId: string, content: string) => {
    const response = await api.post('/comments', { taskId, content });
    return response.data;
};

export const deleteComment = async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
};
