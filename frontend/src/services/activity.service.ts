import api from './api';

export const getActivities = async () => {
    const response = await api.get('/activities');
    return response.data;
};
