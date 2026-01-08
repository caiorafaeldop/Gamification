import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gamification-qlow.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed, or let the UI handle it via state
      // window.location.href = '/'; // Simple redirect approach
    }
    return Promise.reject(error);
  }
);

export default api;
