import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../services/leaderboard.service';
import { getRankingArts, getWeeklyRanking, getHallOfFame } from '../services/ranking.service';

export function useLeaderboard(period: string = 'all', limit: number = 100, projectIds: string[] = []) {
  return useQuery({
    queryKey: ['leaderboard', period, limit, projectIds],
    queryFn: () => getLeaderboard(period, limit, projectIds),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useRankingArts(week?: number, year?: number) {
  return useQuery({
    queryKey: ['ranking-arts', week, year],
    queryFn: () => getRankingArts(week, year),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useHallOfFame(year: number) {
  return useQuery({
    queryKey: ['hall-of-fame', year],
    queryFn: () => getHallOfFame(year),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useWeeklyRanking(week: number, year: number) {
  return useQuery({
    queryKey: ['weekly-ranking', week, year],
    queryFn: () => getWeeklyRanking(week, year),
    enabled: !!week && !!year,
    staleTime: 5 * 60 * 1000,
  });
}
