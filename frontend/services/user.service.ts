import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};



export const updateUser = async (userId: string, data: any) => {
  const response = await api.patch(`/users/${userId}`, data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.users;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/users/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Expected { url: string }
};
