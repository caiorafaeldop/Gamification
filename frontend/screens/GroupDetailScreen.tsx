import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, Users, BookOpen, ArrowLeft, Star, ArrowRight, UserPlus, LogOut, Settings, Globe, Lock, Trophy, Target, Medal, Clock } from 'lucide-react';
import { useGroup, useJoinGroup, useLeaveGroup, useGroups, useRequestJoinGroup } from '../hooks/useGroups';
import { useProfile } from '../hooks/useProfile';
import { useGroupBranding } from '../contexts/BrandingContext';
import { PageHero, SurfaceCard, SectionHeader, EmptyState } from '../components/ui';
import { Skeleton } from '../components/Skeleton';

const GroupDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { group, loading } = useGroup(id);
  const { groups: allGroups } = useGroups();
  const { data: currentUser } = useProfile();
  const joinMutation = useJoinGroup();
  const requestJoinMutation = useRequestJoinGroup();
  const leaveMutation = useLeaveGroup();

  useGroupBranding(group);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
        <Skeleton height="240px" className="w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} className="rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={FlaskConical}
          title="Grupo não encontrado"
          description="Este grupo foi removido ou o link está inválido."
          action={
            <button
              onClick={() => navigate('/groups')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
            >
              <ArrowLeft size={14} /> Voltar para grupos
            </button>
          }
        />
      </div>
    );
  }

  const color = group.color || '#29B6F6';
  const memberCount = group._count?.GroupMember || group.GroupMember?.length || 0;
  const projectCount = group._count?.Project || group.Project?.length || 0;
  const isMember = group.GroupMember?.some((m) => m.userId === currentUser?.id) || false;
  const isAdmin = group.GroupMember?.some((m) => m.userId === currentUser?.id && m.role === 'ADMIN') || false;
  const pendingRequest = group.joinRequests?.find((r) => r.userId === currentUser?.id && r.status === 'PENDING');
  const hasPendingRequest = Boolean(pendingRequest);

  // KPIs calculations
  const sortedGroups = [...(allGroups || [])].sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));
  const rankIndex = sortedGroups.findIndex(g => g.id === group.id);
  const rankingText = rankIndex >= 0 ? `${rankIndex + 1}º Lugar` : '-';

  // Internal Ranking
  const sortedMembers = [...(group.GroupMember || [])].sort((a, b) => (b.User.connectaPoints || 0) - (a.User.connectaPoints || 0));

  const heroHighlight = (
    <div
      className="flex items-center gap-4 rounded-xl border border-white/40 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02] dark:border-white/10 dark:bg-black/20"
    >
      <div
        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl shadow-md"
        style={{ backgroundColor: group.logoUrl ? undefined : color }}
      >
        {group.logoUrl ? (
          <img src={group.logoUrl} alt={group.name} className="h-full w-full object-cover" />
        ) : (
          <FlaskConical className="text-white" size={24} />
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">XP Acumulado</p>
        <p className="mt-0.5 text-lg font-bold" style={{ color }}>{group.totalXp || 0} pts</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={FlaskConical}
        tagLabel={
          <button 
            onClick={() => navigate('/groups')} 
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" 
            style={{ color }}
          >
            <ArrowLeft size={12} /> Voltar para Grupos
          </button>
        }
        title={group.name}
        description={group.description || 'Um grupo colaborativo em nossa plataforma. Explore os projetos, conheça os membros e veja o impacto gerado.'}
        highlight={heroHighlight}
        actionButtons={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {!isMember ? (
              hasPendingRequest ? (
                <button
                  disabled
                  className="flex items-center gap-2 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-600 transition-all dark:text-amber-500"
                >
                  <Clock size={14} /> Solicitação Pendente
                </button>
              ) : group.isRestricted ? (
                <button
                  onClick={() => requestJoinMutation.mutate(group.id)}
                  disabled={requestJoinMutation.isPending}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: color, boxShadow: `0 8px 20px -8px ${color}` }}
                >
                  <Lock size={14} /> Solicitar Entrada
                </button>
              ) : (
                <button
                  onClick={() => joinMutation.mutate(group.id)}
                  disabled={joinMutation.isPending}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: color, boxShadow: `0 8px 20px -8px ${color}` }}
                >
                  <UserPlus size={14} /> Entrar no Grupo
                </button>
              )
            ) : (
              <>
                {isAdmin && (
                  <button
                    onClick={() => navigate(`/groups/${group.id}/edit`)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Settings size={14} /> Editar
                  </button>
                )}
                <button
                  onClick={() => leaveMutation.mutate(group.id)}
                  disabled={leaveMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  <LogOut size={14} /> Sair
                </button>
              </>
            )}
          </div>
        }
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SurfaceCard padding="sm" className="flex items-center gap-4 overflow-hidden relative">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: color }} />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Membros</p>
            <p className="text-xl font-bold leading-none text-secondary dark:text-white">{memberCount}</p>
          </div>
        </SurfaceCard>

        <SurfaceCard padding="sm" className="flex items-center gap-4 overflow-hidden relative">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: color }} />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Projetos Ativos</p>
            <p className="text-xl font-bold leading-none text-secondary dark:text-white">{projectCount}</p>
          </div>
        </SurfaceCard>

        <SurfaceCard padding="sm" className="flex items-center gap-4 overflow-hidden relative border" style={{ borderColor: `${color}30` }}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: color }} />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner" style={{ backgroundColor: color, color: '#fff' }}>
            <Medal size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Ranking Global</p>
            <p className="text-xl font-bold leading-none text-secondary dark:text-white">{rankingText}</p>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Projects */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            icon={<Target size={18} style={{ color }} />}
            title="Projetos do Grupo"
            description="Iniciativas que estão sendo desenvolvidas por este grupo."
          />

          {!group.Project || group.Project.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sem projetos ainda"
              description="Nenhum projeto foi vinculado a este grupo ainda."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {group.Project.map((project) => (
                <GroupProjectCard key={project.id} project={project} color={color} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Internal Ranking */}
        <div className="space-y-4">
          <SectionHeader
            icon={<Trophy size={18} style={{ color }} />}
            title="Ranking Interno"
            description="Os maiores pontuadores do grupo."
          />
          
          <SurfaceCard padding="none" className="overflow-hidden border border-gray-100 dark:border-gray-800">
            {!sortedMembers || sortedMembers.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-500">Nenhum membro encontrado.</p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {sortedMembers.map((m, index) => (
                  <div key={m.userId} className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold text-gray-400">
                        {index === 0 ? <Medal size={16} className="text-yellow-500" /> : 
                         index === 1 ? <Medal size={16} className="text-gray-400" /> :
                         index === 2 ? <Medal size={16} className="text-amber-700" /> : 
                         `${index + 1}º`}
                      </div>
                      
                      {m.User.avatarUrl ? (
                        <img src={m.User.avatarUrl} alt={m.User.name} className="h-8 w-8 rounded-full border border-gray-200 object-cover shadow-sm dark:border-gray-700" />
                      ) : (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: m.User.avatarColor || color }}
                        >
                          {m.User.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                         <button 
                           onClick={() => navigate(`/profile/${m.userId}`)}
                           className="cursor-pointer text-left text-xs font-bold text-secondary hover:underline dark:text-gray-200"
                         >
                           {m.User.name}
                         </button>
                         <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400" style={{ color: m.role === 'ADMIN' ? color : undefined }}>
                           {m.role === 'ADMIN' ? 'Admin' : 'Membro'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-surface-darker dark:text-gray-400">
                      {m.User.connectaPoints || 0} <span className="font-medium opacity-70">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

interface GroupProjectCardProps {
  project: NonNullable<ReturnType<typeof useGroup>['group']>['Project'] extends (infer U)[] | undefined ? U : never;
  color: string;
}

const GroupProjectCard: React.FC<{ project: any; color: string }> = ({ project, color }) => {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/project-landing/${project.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--project-color)] hover:shadow-md dark:border-gray-800 dark:bg-surface-dark"
      style={{ ['--project-color' as any]: color }}
    >
      <div className="relative h-28 overflow-hidden bg-gray-200">
        {project.coverUrl ? (
          <img
            src={project.coverUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)` }}
          >
            <BookOpen size={32} style={{ color: `${color}88` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-2 left-3 z-10 flex gap-1.5">
          {project.visibility === 'PUBLIC' ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              <Globe size={8} /> Público
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              <Lock size={8} /> Privado
            </span>
          )}
          {project.isJoiningOpen && (
            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: color }}>
              Aberto
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-sm font-bold leading-tight text-secondary transition-colors group-hover:text-[var(--project-color)] dark:text-gray-100">
          {project.title}
        </h4>
        <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{project.description}</p>
        
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Users size={12} /> {project._count?.members || 0} {((project._count?.members || 0) === 1) ? 'membro' : 'membros'}
          </div>
          <ArrowRight size={14} className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[var(--project-color)]" />
        </div>
      </div>
    </article>
  );
};

export default GroupDetailScreen;

