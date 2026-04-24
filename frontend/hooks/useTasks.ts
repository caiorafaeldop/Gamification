import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks, updateTaskStatus } from '../services/task.service';

export const useTasks = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId),
    enabled: !!projectId,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const moveMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: string }) =>
      updateTaskStatus(taskId, newStatus),
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = queryClient.getQueryData<any[]>(['tasks', projectId]);
      queryClient.setQueryData<any[]>(['tasks', projectId], (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tasks', projectId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const moveTask = (taskId: string, newStatus: string) =>
    moveMutation.mutate({ taskId, newStatus });

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: error ? (error as any).message || 'Failed to fetch tasks' : null,
    refetch,
    moveTask,
  };
};
