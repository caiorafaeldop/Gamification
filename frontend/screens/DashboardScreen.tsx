import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, CheckSquare, Trophy, ArrowRight, Store, Folder, Star, Sparkles } from 'lucide-react';
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

  const { user, activeTaskCount, projects, recentActivity } = data;
  const firstName = user?.name?.split(' ')[0] || 'Estudante';

  const heroHighlight = (
    <div className="w-full rounded-2xl border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/20 lg:w-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Minha Pontuação</p>
          <p className="mt-1 text-3xl font-display font-black text-primary">
            {user.points} <span className="text-base text-gray-400">🪙</span>
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg shadow-yellow-500/30">
          <Trophy className="text-white" size={28} />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300">
          <span>Nível</span>
          <span className="text-secondary dark:text-white">{user.tier}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 shadow-[0_0_10px_rgba(41,182,246,0.5)] transition-all"
            style={{ width: `${user.tierProgress}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-500 dark:text-gray-400">
          Faltam {user.nextTierPoints} 🪙 p/ próximo nível
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
        icon={Sun}
        tagLabel="Bom dia"
        title={<>Olá, <span className="text-primary">{firstName}!</span></>}
        description={`Você tem ${activeTaskCount} tarefas em andamento. Continue colaborando para subir no ranking!`}
        highlight={heroHighlight}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-6">
            <SectionHeader
              icon={<Folder size={22} />}
              title="Projetos que você participa"
              description="Continue colaborando nos projetos em andamento."
              action={
                <Link
                  to="/projects"
                  className="group hidden items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white active:scale-95 sm:inline-flex"
                >
                  Ver todos
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />

            {projects.length === 0 ? (
              <EmptyState
                icon={Folder}
                title="Ainda sem projetos"
                description="Você ainda não participa de nenhum projeto. Explore a lista e encontre algo que te inspire."
                action={
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
                  >
                    Procurar projetos
                    <ArrowRight size={14} />
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {projects.map((project: any) => (
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
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          {project.category || 'Geral'}
                        </span>
                        {project.status === 'archived' && (
                          <span className="rounded bg-gray-500/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                            Arquivado
                          </span>
                        )}
                        {project.status === 'inactive' && (
                          <span className="rounded bg-yellow-500/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="text-sm font-display font-bold leading-tight text-secondary transition-colors group-hover:text-primary dark:text-white">
                        {project.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {project.leader?.avatarUrl ? (
                          <img
                            src={project.leader.avatarUrl}
                            alt={project.leader.name}
                            className="h-5 w-5 rounded-full border border-primary/20 object-cover"
                          />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[9px] font-bold text-primary">
                            {project.leader?.name?.charAt(0) || 'L'}
                          </div>
                        )}
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Líder: <span className="font-semibold text-gray-700 dark:text-gray-200">{project.leader?.name || 'Desconhecido'}</span>
                        </span>
                      </div>
                      <div className="mt-auto border-t border-gray-100 pt-2 dark:border-gray-700">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/project-details/${project.id}`); }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                          Acessar <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="sm:hidden">
              <Link
                to="/projects"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white active:scale-95"
              >
                Ver todos
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={20} />}
              title="Atividade Recente"
              titleClassName="text-lg"
            />
            <div className="mt-4 space-y-3">
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Nada por aqui ainda"
                  description="Suas próximas conquistas e movimentos aparecerão aqui."
                  compact
                />
              ) : recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="rounded-xl bg-gray-50 p-3 shadow-sm dark:bg-surface-darker">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {(() => {
                      const desc = activity.description;
                      const achievementMatch = desc.match(/^Earned achievement: "(.*)"!$/);
                      if (achievementMatch) {
                        return (
                          <span>
                            Você ganhou a conquista <span className="font-bold text-primary">"{achievementMatch[1]}"</span> 🏆
                          </span>
                        );
                      }
                      const createdTaskMatch = desc.match(/^Created task "(.*)" for project "(.*)"\.$/);
                      if (createdTaskMatch) {
                        return `Criou a tarefa "${createdTaskMatch[1]}" no projeto "${createdTaskMatch[2]}".`;
                      }
                      const assignedTaskMatch = desc.match(/^Assigned task "(.*)" to (.*)\.$/);
                      if (assignedTaskMatch) {
                        return `Atribuiu a tarefa "${assignedTaskMatch[1]}" a ${assignedTaskMatch[2]}.`;
                      }
                      const joinedProjectMatch = desc.match(/^Joined project "(.*)"\.$/);
                      if (joinedProjectMatch) {
                        return `Entrou no projeto "${joinedProjectMatch[1]}".`;
                      }
                      if (desc.startsWith('Completed a task and earned')) {
                        const points = desc.match(/earned (\d+)/)?.[1];
                        return `Concluiu uma tarefa e ganhou ${points || ''} pontos.`;
                      }
                      if (desc.startsWith('Achieved new tier:')) {
                        const tier = desc.match(/tier: (.*)!/)?.[1];
                        return `Alcançou o nível ${tier || ''}! 🎉`;
                      }
                      if (desc.startsWith('Streak updated:')) {
                        return 'Sequência diária atualizada!';
                      }
                      return desc;
                    })()}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-sky-500 p-6 text-center text-white shadow-lg shadow-primary/30">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Store className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-display font-bold">Troque seus Pontos!</h3>
              <p className="mt-1 text-sm text-white/80">Novos itens disponíveis na loja.</p>
              <button className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-gray-100">
                Em Breve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
