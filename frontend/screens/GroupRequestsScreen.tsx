import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, User, Clock, 
  Shield, Users, ArrowUpDown
} from 'lucide-react';
import { useGroupRequests, useRespondToJoinRequest, useGroup } from '../hooks/useGroups';
import { 
  PageHero, 
  SurfaceCard, 
  SectionHeader, 
  EmptyState,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '../components/ui';
import { Skeleton } from '../components/Skeleton';

const GroupRequestsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { group } = useGroup(id);
  const { requests, loading } = useGroupRequests(id);
  const respondMutation = useRespondToJoinRequest(id || '');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    return [...requests].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [requests, sortOrder]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1480px] flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Skeleton height={200} className="rounded-3xl" />
        <Skeleton height={400} className="rounded-2xl" />
      </div>
    );
  }

  const color = group?.color || '#3B82F6';

  return (
    <div className="mx-auto max-w-[1480px] flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Shield}
        tagLabel={
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20 cursor-pointer"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        }
        title="Solicitações do Grupo"
        description={`Gerencie quem deseja participar do grupo "${group?.name || 'seu grupo'}".`}
      />

      <div className="max-w-4xl mx-auto w-full">
        <SurfaceCard padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
            <SectionHeader
              icon={<Clock size={20} style={{ color }} />}
              title="Pedidos Pendentes"
              description={`${requests?.length || 0} pessoas aguardando aprovação.`}
            />

            {requests && requests.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown size={14} className="text-gray-400 shrink-0" />
                <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="desc">Mais recentes</SelectItem>
                      <SelectItem value="asc">Mais antigos</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {!sortedRequests || sortedRequests.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Tudo em ordem!"
                description="Não há solicitações pendentes para este grupo."
              />
            ) : (
              sortedRequests.map((request: any) => (
                <div 
                  key={request.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/5 transition-all hover:border-primary/20 group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0"
                      style={{ backgroundColor: request.user?.avatarColor || color }}
                    >
                      {request.user?.avatarUrl ? (
                        <img src={request.user.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        request.user?.name?.charAt(0).toUpperCase() || <User size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-secondary dark:text-white truncate">{request.user?.name}</h4>
                      <p className="text-xs text-gray-500">Solicitou em {new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'REJECTED' })}
                      disabled={respondMutation.isPending}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10 transition-colors text-sm font-bold cursor-pointer disabled:opacity-50"
                    >
                      <X size={16} /> Recusar
                    </button>
                    <button
                      onClick={() => respondMutation.mutate({ requestId: request.id, action: 'APPROVED' })}
                      disabled={respondMutation.isPending}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white shadow-lg transition-all font-bold text-sm hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: color, boxShadow: `0 8px 20px -8px ${color}` }}
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

export default GroupRequestsScreen;

