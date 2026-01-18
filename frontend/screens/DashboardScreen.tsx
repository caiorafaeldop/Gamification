import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, CheckSquare, Trophy, Code, Megaphone, ArrowRight, Store, Folder, Star } from 'lucide-react';
import { getDashboardData } from '../services/dashboard.service';
import { Skeleton } from '../components/Skeleton';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Card Skeleton */}
      <Skeleton height="300px" className="w-full rounded-3xl" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <Skeleton width="40%" height="32px" className="rounded-lg" />
              <Skeleton width="100px" height="36px" className="hidden sm:block rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton height="200px" className="rounded-2xl" />
              <Skeleton height="200px" className="rounded-2xl" />
            </div>
            {/* Mobile View All Skeleton */}
            <div className="mt-6 sm:hidden">
              <Skeleton height="48px" className="w-full rounded-xl" />
            </div>
          </section>
        </div>

        {/* Sidebar Widgets Skeleton */}
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 32px)' }}>
      {/* Header Card */}
      <header className="relative rounded-3xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="absolute inset-0 bg-network-pattern opacity-50 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center justify-center lg:justify-start gap-2">
              <Sun size={14} className="text-yellow-500" />
              Bom dia
            </p>
            <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-secondary dark:text-white mb-2">
              Olá, <span className="text-primary">{user.name}!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              Você tem {activeTaskCount} tarefas em andamento. Continue colaborando para subir no ranking!
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <button onClick={() => navigate('/activities')} className="px-5 py-2.5 bg-secondary dark:bg-white text-white dark:text-secondary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg">
                <CheckSquare size={16} /> Ver Tarefas
              </button>
              <button onClick={() => navigate('/ranking')} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
                <Trophy size={16} /> Ranking Geral
              </button>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 w-full lg:w-96 border border-white/40 dark:border-white/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Minha Pontuação</p>
                <p className="text-4xl font-display font-black text-primary">{user.points} <span className="text-lg text-gray-400 font-bold">🪙</span></p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Trophy className="text-white" size={28} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>Nível: <span className="text-secondary dark:text-white">{user.tier}</span></span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-sky-500 rounded-full shadow-[0_0_10px_rgba(29,78,216,0.5)]" style={{ width: `${user.tierProgress}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">Faltam {user.nextTierPoints} 🪙 para o próximo nível</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-secondary dark:text-white flex items-center gap-2">
                <Folder className="text-primary" size={24} />
                Projetos que você participa
              </h2>
              <Link 
                to="/projects" 
                className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all duration-300 group shadow-sm active:scale-95 min-w-[120px]"
              >
                Ver todos
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-2 text-center py-6 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-500 text-sm">Você ainda não participa de nenhum projeto.</p>
                  <Link to="/projects" className="text-primary font-bold mt-2 inline-block text-sm">Procurar Projetos</Link>
                </div>
              ) : projects.map((project: any) => (
                <article key={project.id} onClick={() => navigate(`/project-details/${project.id}`)} className="cursor-pointer bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full group">
                  <div className="h-28 bg-gray-200 relative overflow-hidden">
                    {project.coverUrl ? (
                      <img
                        src={project.coverUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent flex items-center justify-center">
                        <Star size={32} className="text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 z-20">
                      <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">{project.category || 'Geral'}</span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-display font-bold text-secondary dark:text-white leading-tight group-hover:text-primary transition-colors">{project.title}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-1.5 mb-2">
                      {project.leader?.avatarUrl ? (
                        <img src={project.leader.avatarUrl} alt={project.leader.name} className="w-5 h-5 rounded-full object-cover border border-primary/20" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] text-primary font-bold border border-primary/20">
                          {project.leader?.name?.charAt(0) || 'L'}
                        </div>
                      )}
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Líder: <span className="font-semibold text-gray-700 dark:text-gray-200">{project.leader?.name || 'Desconhecido'}</span></span>
                    </div>
                    
                    <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/project-details/${project.id}`); }}
                        className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-1.5 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
                      >
                        Acessar <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {/* Mobile View All Button */}
            <div className="mt-6 sm:hidden">
              <Link 
                to="/projects" 
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all duration-300 group shadow-sm active:scale-95"
              >
                Ver todos
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Recentes */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800">
            <h3 className="font-display font-bold text-lg text-secondary dark:text-white mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? <p className="text-sm text-gray-500">Nenhuma atividade recente.</p> : recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="bg-gray-50 dark:bg-surface-darker p-3 rounded-xl shadow-sm flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(() => {
                        const desc = activity.description;
                        const achievementMatch = desc.match(/^Earned achievement: "(.*)"!$/);
                        
                        if (achievementMatch) {
                          return (
                            <span>
                              Você ganhou a conquista <span className="font-bold text-blue-600 dark:text-blue-400">"{achievementMatch[1]}"</span> 🏆
                            </span>
                          );
                        }

                        // Traduções adicionais
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
                    <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-sky-500 rounded-2xl p-6 text-center text-white shadow-lg shadow-primary/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">Troque seus Pontos!</h3>
            <p className="text-sm text-white/80 mb-4">Novos itens disponíveis na loja.</p>
            <button className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm w-full hover:bg-gray-100 transition-colors">
              Em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;