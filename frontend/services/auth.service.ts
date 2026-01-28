import api from './api';

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    famenePoints: number;
    tier?: string;
    avatarColor?: string;
    course?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const resetPassword = async (email: string, newPassword: string, secretWord: string) => {
  const response = await api.post('/auth/reset-password', { email, newPassword, secretWord });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
