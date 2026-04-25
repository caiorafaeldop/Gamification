import React, { useState, useMemo } from 'react';
import { Trophy, Calendar, Filter, Crown, Users } from 'lucide-react';
import { Skeleton } from './Skeleton';
import ProjectFilterSelect from './ProjectFilterSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { SurfaceCard, EmptyState } from './ui';
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

const RankingTab = () => {
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

  const toggleProject = (projectId: string) =>
    setSelectedProjectIds((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId]
    );

  const currentUserRankData = rankingData.find((u) => u.id === currentUser?.id);
  const activeFilterLabel = FILTERS.find((f) => f.id === activeFilter)?.label;

  const topThree = rankingData.slice(0, 3);
  const remaining = rankingData.slice(3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-surface-light px-3 py-2 text-xs text-gray-500 shadow-sm dark:border-gray-700 dark:bg-surface-dark dark:text-gray-400">
            <Calendar size={14} />
            <span>
              Período: <span className="font-bold text-primary">{activeFilterLabel}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[160px] bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Selecionar Período" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.map((filter) => (
                  <SelectItem key={filter.id} value={filter.id}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <SurfaceCard padding="md">
        <ProjectFilterSelect
          projects={projects}
          selectedProjectIds={selectedProjectIds}
          onToggle={toggleProject}
          onClear={() => setSelectedProjectIds([])}
        />
      </SurfaceCard>

      {loading ? (
        <div className="mx-auto max-w-4xl space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={64} className="rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Trophy} title="Erro ao carregar" description={error} />
      ) : rankingData.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum dado de ranking"
          description="Ainda não há pontuação registrada para este período. Continue colaborando para aparecer aqui!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-12 xl:col-span-5">
            <SurfaceCard padding="lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pódio · {activeFilterLabel}</p>
              <div className="mt-6 flex min-h-[280px] items-end justify-center gap-3 lg:gap-6">
                {topThree[1] ? (
                  <div className="flex w-1/3 max-w-[120px] flex-col items-center gap-3">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-4 border-slate-400 bg-slate-300 shadow-2xl dark:bg-slate-700">
                        {topThree[1].avatarUrl ? (
                          <img src={topThree[1].avatarUrl} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          <Users className="text-white/40" />
                        )}
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-[9px] font-black text-white shadow-lg dark:border-slate-900">
                        2º
                      </div>
                    </div>
                    <div className="flex h-20 w-full flex-col items-center rounded-t-2xl border-x-2 border-t-2 border-slate-300 bg-slate-200 pt-3 shadow-2xl dark:border-white/5 dark:bg-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-500">Prata</span>
                      <span className="mt-1.5 w-full truncate px-1 text-center text-xs font-black text-secondary dark:text-white">
                        {topThree[1].name}
                      </span>
                      <span className="mt-1 text-[9px] font-black text-slate-500">
                        {(topThree[1].connectaPoints || topThree[1].points || 0).toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>
                ) : null}

                {topThree[0] ? (
                  <div className="z-10 flex w-1/3 max-w-[140px] flex-col items-center gap-4">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-amber-300 bg-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)] dark:bg-amber-500">
                        {topThree[0].avatarUrl ? (
                          <img src={topThree[0].avatarUrl} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <Crown className="text-white/30" />
                        )}
                      </div>
                      <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-500 shadow-2xl dark:border-slate-900">
                        <Crown size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="relative flex h-32 w-full flex-col items-center rounded-t-2xl border-t-2 border-amber-500 bg-secondary pt-5 shadow-2xl">
                      <span className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400">Mestre</span>
                      <span className="w-full truncate px-4 text-center text-sm font-black text-white">
                        {topThree[0].name}
                      </span>
                      <span className="mt-1.5 text-[9px] font-black text-amber-400">
                        {(topThree[0].connectaPoints || topThree[0].points || 0).toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>
                ) : null}

                {topThree[2] ? (
                  <div className="flex w-1/3 max-w-[120px] flex-col items-center gap-3">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-4 border-amber-600 bg-amber-700 shadow-2xl dark:bg-orange-900">
                        {topThree[2].avatarUrl ? (
                          <img src={topThree[2].avatarUrl} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          <Users className="text-white/40" />
                        )}
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-700 text-[9px] font-black text-white shadow-lg dark:border-slate-900">
                        3º
                      </div>
                    </div>
                    <div className="flex h-16 w-full flex-col items-center rounded-t-2xl border-x-2 border-t-2 border-slate-300 bg-slate-200 pt-3 shadow-2xl dark:border-white/5 dark:bg-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-500">Bronze</span>
                      <span className="mt-1.5 w-full truncate px-1 text-center text-xs font-black text-secondary dark:text-white">
                        {topThree[2].name}
                      </span>
                      <span className="mt-1 text-[9px] font-black text-slate-500">
                        {(topThree[2].connectaPoints || topThree[2].points || 0).toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </SurfaceCard>

            {currentUserRankData && (
              <SurfaceCard padding="md" className="border-primary/30 bg-primary/5 dark:bg-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Sua posição</p>
                <p className="mt-1 text-2xl font-display font-black text-secondary dark:text-white">
                  #{currentUserRankData.rank}
                  <span className="ml-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                    · {(currentUserRankData.connectaPoints || currentUserRankData.points || 0).toLocaleString()} 🪙
                  </span>
                </p>
              </SurfaceCard>
            )}
          </div>

          <SurfaceCard padding="none" className="overflow-hidden lg:col-span-12 xl:col-span-7">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-display font-bold uppercase tracking-tight text-secondary dark:text-white">
                  Competidores
                </h3>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Evolução em tempo real
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users size={20} />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {remaining.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">Apenas pódio registrado neste período.</p>
                ) : (
                  remaining.map((student) => {
                    const isMe = student.id === currentUser?.id;
                    return (
                      <div
                        key={student.id}
                        className={`grid grid-cols-12 items-center gap-4 py-3 ${isMe ? 'bg-primary/5 dark:bg-primary/10 rounded-xl px-2' : ''}`}
                      >
                        <div className="col-span-2 text-center sm:col-span-1">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                              isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                            }`}
                          >
                            {student.rank}
                          </span>
                        </div>
                        <Link
                          to={`/profile/${student.id}`}
                          className="group col-span-7 flex min-w-0 cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:col-span-8"
                        >
                          <img
                            src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                            alt={student.name}
                            className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-primary/50 transition-all group-hover:ring-2"
                          />
                          <span
                            className={`truncate font-bold transition-colors group-hover:text-primary ${
                              isMe ? 'text-primary' : 'text-secondary dark:text-white'
                            }`}
                          >
                            {student.name} {isMe && <span className="text-xs font-medium text-gray-500">(Você)</span>}
                          </span>
                        </Link>
                        <div className="col-span-3 text-right font-black text-primary">
                          {Math.max(0, student.connectaPoints || student.points || 0).toLocaleString()} 🪙
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
};

export default RankingTab;
