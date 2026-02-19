import api from './api';

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/register', { name, email, password });
  return response.data;
};

export const resetPassword = async (email: string, password: string, secret: string) => {
  // Note: The original implementation might have had a different endpoint or payload. 
  // Assuming a standard reset endpoint here. If 'secret' was a specific challenge, ensure backend supports it.
  // Based on previous view, it seems like a custom implementation.
  const response = await api.post('/auth/reset-password', { email, password, secret });
  return response.data;
};

export const logout = async () => {
  // const clerk = (window as any).Clerk;
  // if (clerk) {
  //     await clerk.signOut();
  // }
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/';
};
