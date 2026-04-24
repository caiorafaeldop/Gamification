import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProfile } from '../services/user.service';

/**
 * Hook de autenticação com hidratação instantânea do localStorage.
 * - `isAuthenticated` / `isLoaded` vêm de `token` (localStorage)
 * - `user` é o usuário do DB (fetch via /users/me), mas hidrata de `user` cacheado pra evitar flash
 * - `logout` limpa token, refreshToken, user
 */
export const useAuth = () => {
  const navigate = useNavigate();

  const [localUser, setLocalUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('token');
    const hasCached = !!localStorage.getItem('user');
    return hasToken && !hasCached;
  });

  const hasToken = !!localStorage.getItem('token');

  useEffect(() => {
    if (hasToken) {
      getProfile()
        .then((data: any) => {
          setLocalUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLocalUser(null);
      setLoading(false);
    }
  }, [hasToken]);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setLocalUser(null);
    navigate('/');
  };

  return {
    isAuthenticated: hasToken,
    isLoaded: !loading || !hasToken,
    user: localUser,
    loading,
    logout,
    getToken: async () => localStorage.getItem('token') || '',
  };
};
