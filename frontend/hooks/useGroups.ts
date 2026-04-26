import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  requestJoinGroup,
  respondToJoinRequest,
  CreateGroupPayload,
} from '../services/group.service';

export const useGroups = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: listGroups,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    groups: data ?? [],
    loading: isLoading,
    error: error ? (error as any).message || 'Falha ao carregar grupos' : null,
    refetch,
  };
};

export const useGroup = (id?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    group: data ?? null,
    loading: isLoading,
    error: error ? (error as any).message || 'Falha ao carregar grupo' : null,
    refetch,
  };
};

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success(`Grupo "${group.name}" criado!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erro ao criar grupo.');
    },
  });
};

export const useUpdateGroup = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateGroupPayload>) => updateGroup(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', id] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo atualizado!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao atualizar.'),
  });
};

export const useJoinGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => joinGroup(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['group', id] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Você entrou no grupo!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao entrar no grupo.'),
  });
};

export const useLeaveGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveGroup(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['group', id] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Você saiu do grupo.');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao sair.'),
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo excluído.');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao excluir.'),
  });
};

export const useRequestJoinGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestJoinGroup(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['group', id] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Solicitação de entrada enviada!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao solicitar entrada.'),
  });
};

export const useRespondToJoinRequest = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'APPROVED' | 'REJECTED' }) => 
      respondToJoinRequest(groupId, requestId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Solicitação processada com sucesso!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao processar solicitação.'),
  });
};
