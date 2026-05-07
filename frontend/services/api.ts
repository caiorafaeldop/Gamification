import axios from 'axios';

// --- Configuração de Backends com Fallback ---
const PRIMARY_URL   = import.meta.env.VITE_BASE_URL     || 'http://localhost:3333/api/v1';
const FALLBACK_URL  = import.meta.env.VITE_FALLBACK_URL || null;

// Erros que indicam que o servidor está fora do ar (não erros de negócio)
const SERVER_DOWN_CODES = new Set([0, 502, 503, 504]);

const api = axios.create({
  baseURL: PRIMARY_URL,
  timeout: 10000, // 10s — evita esperar para sempre antes de tentar o fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
      config.headers.Authorization = `Bearer ${legacyToken}`;
    }
  } catch (error) {
    console.warn('Error attaching tokens:', error);
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasToken = !!localStorage.getItem('token');

    // --- Fallback para o segundo backend ---
    const isServerDown =
      !error.response ||                                    // erro de rede / timeout
      SERVER_DOWN_CODES.has(error.response?.status);        // 502 / 503 / 504

    if (isServerDown && FALLBACK_URL && !originalRequest._fallbackRetry) {
      originalRequest._fallbackRetry = true;
      console.warn(`[API] Backend primário indisponível. Tentando fallback: ${FALLBACK_URL}`);

      // Reescreve a URL da requisição para apontar ao backend secundário
      originalRequest.baseURL = FALLBACK_URL;
      originalRequest.url = originalRequest.url?.replace(PRIMARY_URL, '') ?? originalRequest.url;

      return axios(originalRequest);
    }
    // --- /Fallback ---

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Tenta refresh apenas se já tinha sessão antes (token armazenado)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('token', data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Session expired (Legacy).', refreshError);
        }
      }

      // Se o usuário tinha token (sessão expirada), limpa cache+storage e avisa o app
      if (hasToken) {
        const { clearSession } = await import('../utils/session');
        clearSession();
        window.dispatchEvent(new CustomEvent('auth:expired'));
      } else {
        // Guest tentando ação autenticada — propaga o erro pro chamador exibir o modal/CTA.
        window.dispatchEvent(new CustomEvent('auth:required'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
