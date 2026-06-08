import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Check, Clock, Rocket } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProjectRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectRequestsModal: React.FC<ProjectRequestsModalProps> = ({ isOpen, onClose, projectId }) => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['project-requests', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/join-requests`);
      return response.data;
    },
    enabled: isOpen && !!projectId,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'APPROVED' | 'REJECTED' }) => {
      const response = await api.post(`/projects/join-requests/${requestId}/respond`, { action });
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(variables.action === 'APPROVED' ? 'Aprovado! ✓' : 'Recusado.');
      queryClient.invalidateQueries({ queryKey: ['project-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao processar');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-xl text-primary">
              <span className="material-icons text-xl">group_add</span>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-secondary dark:text-white">Solicitações de Entrada</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gerenciar Membros</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400">Carregando solicitações...</p>
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="py-20 text-center">
              <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="text-gray-300" size={32} />
              </div>
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Tudo em ordem!</h3>
              <p className="text-sm text-gray-500">Não há solicitações pendentes para este projeto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div key={request.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/5 transition-all hover:border-primary/20 group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
                      style={{ backgroundColor: request.user?.avatarColor || '#29B6F6' }}
                    >
                      {request.user?.avatarUrl ? (
                        <img src={request.user.avatarUrl} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary dark:text-white group-hover:text-primary transition-colors">{request.user?.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <Clock size={10} /> {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'REJECTED' })}
                      disabled={respondMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Recusar"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'APPROVED' })}
                      disabled={respondMutation.isPending}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-sky-500 transition-all active:scale-95"
                    >
                      <Check size={16} /> Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectRequestsModal;
