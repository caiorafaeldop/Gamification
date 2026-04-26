import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, CheckSquare, Trophy, ArrowRight, Users, Folder, Star, Sparkles, Heart, Network, Share2, Globe } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { PageHero, SectionHeader, SurfaceCard, EmptyState } from '../components/ui';
import { useDashboard } from '../hooks/useDashboard';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();

  if (loading) return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8 animate-pulse">
      <Skeleton height="220px" className="w-full rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton width="40%" height="32px" className="rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height="200px" className="rounded-2xl" />
            <Skeleton height="200px" className="rounded-2xl" />
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton height="200px" className="rounded-2xl" />
          <Skeleton height="200px" className="rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-surface-light dark:bg-background-dark text-red-500">
      {error}
    </div>
  );

  const { user, activeTaskCount, projects, recentActivity, userGroups = [], topGroups = [] } = data;
  const firstName = user?.name?.split(' ')[0] || 'Estudante';
  const activeProjects = projects.filter((p: any) => p.status !== 'archived');

  const heroHighlight = (
    <div className="w-full rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/20 sm:p-5 lg:w-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Impacto na Rede</p>
          <p className="mt-1 text-2xl font-display font-black text-primary sm:text-3xl">
            {user.points} <span className="text-base text-gray-400">⚡</span>
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 sm:h-14 sm:w-14">
          <Zap className="text-white" size={24} />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300">
          <span>Grau de Conexão</span>
          <span className="text-secondary dark:text-white">{user.tier}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all"
            style={{ width: `${user.tierProgress}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-500 dark:text-gray-400">
          {user.nextTierPoints > 0 ? `+${user.nextTierPoints} xp para o próximo grau` : 'Nível de Elite Conectado'}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 32px)' }}
    >
      <PageHero
        icon={Network}
        tagLabel="Central do Hub"
        title={<>Boas vindas, <span className="text-primary">{firstName}!</span></>}
        description={`Sua contribuição é o que move o ecossistema da nossa comunidade.`}
        highlight={heroHighlight}
        actionButtons={
          <a
            href="https://discord.gg/NfJe4vUdAj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#5865F2]/20 transition-all hover:scale-105 hover:bg-[#4752C4] active:scale-95 group"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="hidden sm:inline">Comunidade Discord</span>
            <ArrowRight size={14} className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          
          {/* My Groups Section */}
          <section className="space-y-6">
            <SectionHeader
              icon={<Users size={22} className="text-primary" />}
              title=" Seus Grupos"
              description="Os pilares da sua rede de colaboração."
              action={
                <Link
                  to="/groups"
                  className="group items-center gap-2 text-xs font-bold text-primary hover:underline hidden sm:flex"
                >
                  Explorar toda a rede
                  <ArrowRight size={14} />
                </Link>
              }
            />
            
            {userGroups.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 p-8 text-center bg-gray-50/50 dark:bg-white/5">
                <Network size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Você ainda não se conectou a nenhum laboratório ou coletivo.</p>
                <Link to="/groups" className="text-primary text-sm font-bold mt-2 inline-block">Descobrir conexões</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group: any) => (
                  <Link 
                    key={group.id} 
                    to={`/groups/${group.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-surface-dark"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: group.color || '#3b82f6' }}
                      >
                        {group.logoUrl ? (
                          <img src={group.logoUrl} alt={group.name} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <span className="text-xl font-bold">{group.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-secondary dark:text-white group-hover:text-primary transition-colors">
                          {group.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Share2 size={10} className="text-cyan-500" />
                          <span>{group.totalLikes || 0} Likes</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Active Projects Section */}
          <section className="space-y-6">
            <SectionHeader
              icon={<Globe size={22} className="text-primary" />}
              title="Seu Ecossistema de Projetos"
              description=""
            />

            {activeProjects.length === 0 ? (
              <EmptyState
                icon={Folder}
                title="Rede silenciosa"
                description="Você ainda não iniciou nenhuma colaboração em projetos."
                action={
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
                  >
                    Descobrir Projetos
                    <ArrowRight size={14} />
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {activeProjects.map((project: any) => (
                  <article
                    key={project.id}
                    onClick={() => navigate(`/project-details/${project.id}`)}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 dark:border-gray-800 dark:bg-surface-dark"
                  >
                    <div className="relative h-28 overflow-hidden bg-gray-200">
                      {project.coverUrl ? (
                        <img
                          src={project.coverUrl}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent">
                          <Star size={32} className="text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 z-20 flex gap-1.5">
                        <span className="rounded bg-cyan-500/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                          {project.category || 'Geral'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="text-sm font-display font-bold leading-tight text-secondary transition-colors group-hover:text-primary dark:text-white">
                        {project.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                      
                      <div className="mt-3 flex items-center justify-between">
                         <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-3">
                            <div 
                              className="h-full bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                              style={{ width: `${project.progress}%` }}
                            />
                         </div>
                         <span className="text-[10px] font-bold text-cyan-600">{Math.round(project.progress)}%</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {/* Trend Hub - Connectivity Preview */}
          <SurfaceCard padding="none" className="overflow-hidden border-cyan-500/20 bg-cyan-500/5">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white">
               <div className="flex items-center gap-2">
                  <Zap size={18} />
                  <h3 className="font-display font-bold uppercase tracking-wider text-sm">Mais Ativos</h3>
               </div>
               <p className="text-[10px] opacity-80 mt-1">Os nós mais ativos do ecossistema</p>
            </div>
            <div className="p-4 space-y-4">
              {topGroups.map((group: any, idx: number) => (
                <div key={group.id} className="flex items-center gap-3">
                   <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                     idx === 0 ? 'bg-cyan-400 text-cyan-900' :
                     idx === 1 ? 'bg-blue-300 text-blue-700' :
                     'bg-indigo-600 text-indigo-100'
                   }`}>
                      {idx + 1}
                   </div>
                   <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      {group.logoUrl ? (
                        <img src={group.logoUrl} alt={group.name} className="h-full w-full object-cover" />
                      ) : (
                        <Users size={14} className="text-primary" />
                      )}
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-secondary dark:text-white">{group.name}</p>
                      <p className="text-[10px] text-gray-400">{group.totalLikes} conexões estabelecidas</p>
                   </div>
                </div>
              ))}

            </div>
          </SurfaceCard>

          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={20} />}
              title="Feed de Atividades"
              titleClassName="text-lg"
            />
            <div className="mt-4 space-y-3">
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Aguardando Likes"
                  description="Suas interações na rede aparecerão aqui."
                  compact
                />
              ) : recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="rounded-xl bg-gray-50 p-3 shadow-sm dark:bg-surface-darker">
                  <p className="text-[13px] leading-tight text-gray-600 dark:text-gray-300">
                    {(() => {
                      const desc = activity.description;
                      const achievementMatch = desc.match(/^Earned achievement: "(.*)"!$/);
                      if (achievementMatch) {
                        return (
                          <span>
                            Expandiu influência: <span className="font-bold text-cyan-500">"{achievementMatch[1]}"</span> ✨
                          </span>
                        );
                      }
                      if (desc.startsWith('Completed a task')) return 'Tarefa sincronizada com sucesso. 🟢';
                      if (desc.startsWith('Achieved new tier:')) return 'Evolução de nó: Novo grau de conexão! 🌐';
                      if (desc.startsWith('Joined project')) return 'Nova Sinergia: Iniciou colaboração. 🤝';
                      return desc;
                    })()}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase">{new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
