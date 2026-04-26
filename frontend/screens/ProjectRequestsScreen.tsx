import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Check, X, User, Clock, 
  CheckCircle, XCircle, Shield, Rocket
} from 'lucide-react';
import api from '../services/api';
import { PageHero, SurfaceCard, SectionHeader, EmptyState } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const ProjectRequestsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['project-requests', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}/join-requests`);
      return response.data;
    },
    enabled: !!id,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'APPROVED' | 'REJECTED' }) => {
      const response = await api.post(`/projects/join-requests/${requestId}/respond`, { action });
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(variables.action === 'APPROVED' ? 'Solicitação aprovada! ✓' : 'Solicitação recusada.');
      queryClient.invalidateQueries({ queryKey: ['project-requests', id] });
      queryClient.invalidateQueries({ queryKey: ['project-landing', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao processar solicitação');
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton height={200} className="rounded-3xl" />
        <Skeleton height={400} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Shield}
        tagLabel={
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        }
        title="Solicitações de Entrada"
        description="Gerencie quem deseja participar do seu projeto. Lembre-se: uma equipe diversa constrói melhor."
      />

      <div className="max-w-4xl mx-auto">
        <SurfaceCard padding="lg">
          <SectionHeader
            icon={<Clock size={20} className="text-primary" />}
            title="Pedidos Pendentes"
            description={`${requests?.length || 0} pessoas aguardando sua resposta.`}
          />

          <div className="mt-6 space-y-4">
            {!requests || requests.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title="Tudo em ordem!"
                description="Não há solicitações pendentes no momento."
              />
            ) : (
              requests.map((request: any) => (
                <div 
                  key={request.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/5 transition-all hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-inner"
                      style={{ backgroundColor: request.user?.avatarColor || '#29B6F6' }}
                    >
                      {request.user?.avatarUrl ? (
                        <img src={request.user.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary dark:text-white">{request.user?.name}</h4>
                      <p className="text-xs text-gray-500">Solicitou em {new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'REJECTED' })}
                      disabled={respondMutation.isPending}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                      <X size={16} /> Recusar
                    </button>
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'APPROVED' })}
                      disabled={respondMutation.isPending}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-sky-500 transition-all font-bold text-sm"
                    >
                      <Check size={16} /> Aprovar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};

export default ProjectRequestsScreen;
