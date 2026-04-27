import { useQuery } from '@tanstack/react-query';
import { getProfile, getUserById } from '../services/user.service';

export function useProfile() {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: hasToken,
  });
}

export function useUserProfile(id?: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
