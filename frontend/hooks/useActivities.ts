import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteEvent, getEvents, joinEvent, leaveEvent, type Event } from '../services/event.service';
import api from '../services/api';

async function getMyTasks(): Promise<any[]> {
  try {
    const response = await api.get('/tasks/my-tasks');
    return response.data || [];
  } catch {
    return [];
  }
}

export function useActivities() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const { data: deadlines = [], isLoading: loadingDeadlines } = useQuery<any[]>({
    queryKey: ['myTasks'],
    queryFn: getMyTasks,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const invalidateEvents = () => queryClient.invalidateQueries({ queryKey: ['events'] });

  const joinMutation = useMutation({
    mutationFn: (eventId: string) => joinEvent(eventId),
    onSuccess: () => {
      toast.success('Participação confirmada!');
      invalidateEvents();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao confirmar.'),
  });

  const leaveMutation = useMutation({
    mutationFn: (eventId: string) => leaveEvent(eventId),
    onSuccess: () => {
      toast.success('Participação cancelada.');
      invalidateEvents();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao cancelar.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      toast.success('Evento excluído.');
      invalidateEvents();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro ao excluir.'),
  });

  return {
    events,
    deadlines,
    loadingEvents,
    loadingDeadlines,
    joinMutation,
    leaveMutation,
    deleteMutation,
  };
}
