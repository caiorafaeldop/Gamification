import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjects, getProjectDetails } from '../services/project.service';

export const useProjects = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    projects: data ?? [],
    loading: isLoading,
    error: error ? (error as any).message || 'Failed to fetch projects' : null,
    refetch,
  };
};

export const useProjectDetails = (id: string) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectDetails(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const setProject = (updater: any) => {
    queryClient.setQueryData(
      ['project', id],
      typeof updater === 'function' ? updater : updater
    );
  };

  return {
    project: data ?? null,
    setProject,
    loading: isLoading,
    error: error ? (error as any).message || 'Failed to fetch project details' : null,
    refetch,
  };
};
