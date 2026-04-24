import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/dashboard.service';

export function useDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    data,
    loading: isLoading,
    error: error ? 'Falha ao carregar dados do dashboard.' : null,
    refresh: refetch,
  };
}
