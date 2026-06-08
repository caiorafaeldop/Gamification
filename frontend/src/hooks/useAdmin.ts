import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminProjects,
  updateProject,
  getAdminUsers,
  updateUserPoints,
  getAdminLogs,
} from '../services/admin.service';
import { GetAdminLogsParams, GetAdminUsersParams } from '../types';

export function useAdminProjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-projects'],
    queryFn: getAdminProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      updateProject(projectId, data),
    onSuccess: () => {
      toast.success('Projeto atualizado.');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar.'),
  });

  return { ...query, updateMutation };
}

export function useAdminUsers(params: GetAdminUsersParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const pointsMutation = useMutation({
    mutationFn: ({ userId, points }: { userId: string; points: number }) =>
      updateUserPoints(userId, points),
    onSuccess: () => {
      toast.success('Pontos atualizados.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar pontos.'),
  });

  return { ...query, pointsMutation };
}

export function useAdminLogs(params: GetAdminLogsParams) {
  return useQuery({
    queryKey: ['admin-logs', params],
    queryFn: () => getAdminLogs(params),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
