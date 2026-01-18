import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
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
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Tenta renovar o token
        // Usamos axios diretamente para evitar loop infinito nos interceptors da instância 'api'
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Atualiza tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken); // Atualiza também o refresh token (rolling session)

        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retenta a requisição original com o novo token
        return api(originalRequest);
        
      } catch (refreshError) {
        // Se falhar o refresh (ex: refresh token expirado), desloga o usuário
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Ou use navigate se possível, mas window.location é mais seguro aqui
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
