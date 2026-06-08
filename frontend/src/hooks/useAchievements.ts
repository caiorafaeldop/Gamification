import { useQuery } from '@tanstack/react-query';
import { getAchievements, getMyAchievements, getUserAchievements } from '../services/achievement.service';

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useMyAchievements() {
  return useQuery({
    queryKey: ['my-achievements'],
    queryFn: getMyAchievements,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useUserAchievements(userId?: string) {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: () => getUserAchievements(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
