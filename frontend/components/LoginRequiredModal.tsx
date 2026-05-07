import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';

interface LoginRequiredContextValue {
  open: (message?: string) => void;
}

const LoginRequiredContext = createContext<LoginRequiredContextValue | null>(null);

export const useLoginRequired = () => {
  const ctx = useContext(LoginRequiredContext);
  if (!ctx) throw new Error('useLoginRequired must be used within LoginRequiredProvider');
  return ctx;
};

export const LoginRequiredProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>('Faça login para continuar.');
  const navigate = useNavigate();
  const location = useLocation();

  const open = useCallback((msg?: string) => {
    setMessage(msg || 'Faça login para continuar.');
    setVisible(true);
  }, []);

  const close = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    const handler = () => open();
    window.addEventListener('auth:required', handler);
    window.addEventListener('auth:expired', handler);
    return () => {
      window.removeEventListener('auth:required', handler);
      window.removeEventListener('auth:expired', handler);
    };
  }, [open]);

  const goLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    setVisible(false);
    navigate(`/login?returnTo=${returnTo}`);
  };

  const goSignUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    navigate('/login?view=register');
  };

  return (
    <LoginRequiredContext.Provider value={{ open }}>
      {children}
      {visible && createPortal(
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-surface-light p-6 shadow-2xl dark:bg-surface-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <h2 className="pr-8 text-xl font-display font-extrabold text-secondary dark:text-white">
              Entre para continuar
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={goLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01]"
              >
                <LogIn size={16} /> Entrar
              </button>
              <button
                type="button"
                onClick={goSignUp}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-secondary transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-white/5 dark:text-white"
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={close}
                className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Continuar explorando
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </LoginRequiredContext.Provider>
  );
};

export default LoginRequiredProvider;
