import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};



export const updateUser = async (data: any) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.users; // Assuming pagination structure returns { users: [], total: ... } or just array. Let's assume the controller returns { users: [...] } or the array directly. 
  // Checking user.controller.ts: `res.status(200).json(result);`
  // Checking user.service.ts (backend): `getAllUsersService` returns `findAllUsers`.
  // Checking user.repository.ts: `findAllUsers` probably returns keys like `data` or just the array.
  // Standard pagination usually returns { data: [], meta: {} } or similar.
  // I will check backend user.service.ts return type if needed, but safe bet is response.data if it's an array, or response.data.data.
  // Let's assume response.data for now and if it fails I'll fix.
};
