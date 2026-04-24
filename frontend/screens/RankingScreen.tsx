import React, { useState, useMemo } from 'react';
import { Trophy, Calendar, Filter } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import ProjectFilterSelect from '../components/ProjectFilterSelect';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useRanking';
import { useProfile } from '../hooks/useProfile';
import { useProjects } from '../hooks/useProjects';

const FILTERS = [
  { id: 'daily', label: 'Diário' },
  { id: 'week', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' },
  { id: 'all', label: 'Global' },
];

const RankingScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const { data: currentUser } = useProfile();
  const { projects } = useProjects();
  const { data: leaderboardRaw, isLoading: loading, error: queryError } = useLeaderboard(
    activeFilter,
    100,
    selectedProjectIds
  );

  const rankingData = useMemo(() => {
    const list = Array.isArray(leaderboardRaw) ? leaderboardRaw : [];
    return list.map((u: any, i: number) => ({ ...u, rank: i + 1 }));
  }, [leaderboardRaw]);

  const error = queryError ? 'Falha ao carregar ranking.' : null;

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  };

  const currentUserRankData = rankingData.find((u) => u.id === currentUser?.id);

  return (
    <div className="min-h-full relative bg-background-light dark:bg-background-dark">
      <header className="pt-6 px-4 lg:px-10 z-20 relative bg-surface-light/80 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50 pb-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-secondary dark:text-white flex items-center gap-2">
            <Trophy className="text-primary" size={24} />{' '}
            {selectedProjectIds.length > 0 ? 'Ranking por Projeto' : 'Ranking Global'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <Calendar size={14} />
            <span>
              Período:{' '}
              <span className="font-bold text-primary">
                {FILTERS.find((f) => f.id === activeFilter)?.label}
              </span>
            </span>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide items-center">
          <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all transform active:scale-95 ${
                activeFilter === filter.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                  : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <ProjectFilterSelect
          projects={projects}
          selectedProjectIds={selectedProjectIds}
          onToggle={toggleProject}
          onClear={() => setSelectedProjectIds([])}
        />
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-10 py-6 pb-20">
        {loading ? (
          <div className="space-y-3 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={56} className="rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 font-medium">{error}</p>
        ) : rankingData.length === 0 ? (
          <p className="text-center text-gray-500 font-medium">Nenhum dado de ranking disponível.</p>
        ) : (
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {rankingData.map((student) => {
              const isMe = student.id === currentUser?.id;
              return (
                <div
                  key={student.id}
                  className={`grid grid-cols-12 items-center gap-4 p-4 ${isMe ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <div className="col-span-2 sm:col-span-1 text-center">
                    <span
                      className={`font-black text-xs h-7 w-7 inline-flex items-center justify-center rounded-lg ${
                        isMe ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {student.rank}
                    </span>
                  </div>
                  <Link to={`/profile/${student.id}`} className="col-span-7 sm:col-span-8 flex items-center gap-3 min-w-0 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 -m-1 rounded-lg transition-colors">
                    <img
                      src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 group-hover:ring-2 ring-primary/50 transition-all"
                    />
                    <span
                      className={`font-bold truncate group-hover:text-primary transition-colors ${
                        isMe ? 'text-primary' : 'text-secondary dark:text-white'
                      }`}
                    >
                      {student.name} {isMe && '(Você)'}
                    </span>
                  </Link>
                  <div className="col-span-3 text-right font-black text-primary">
                    {Math.max(0, student.connectaPoints || student.points || 0)} 🪙
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentUserRankData && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Sua posição atual: #{currentUserRankData.rank}
          </p>
        )}
      </div>
    </div>
  );
};

export default RankingScreen;
