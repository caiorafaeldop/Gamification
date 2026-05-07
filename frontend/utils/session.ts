import { queryClient } from '../index';

const AUTH_KEYS = ['token', 'refreshToken', 'user'];

/**
 * Limpa todo estado da sessão (auth + cache do React Query).
 * - Use no logout (reload = true) → reinicia tudo, garante zero contaminação.
 * - Use no login (reload = false) → zera cache da sessão anterior antes de
 *   navegar pra dashboard com a nova conta.
 */
export const clearSession = (opts: { reload?: boolean } = {}) => {
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
  queryClient.clear();

  if (opts.reload) {
    window.location.href = '/';
  }
};
