import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Filter, Loader } from 'lucide-react';
import { getLeaderboard } from '../services/leaderboard.service';
import { getProfile } from '../services/user.service';
import { Skeleton } from '../components/Skeleton';

const FILTERS = [
  { id: 'daily', label: 'Diário' },
  { id: 'week', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' },
  { id: 'all', label: 'Global' },
];

const RankingScreen = () => {
  // Use 'all' as default if backend defaults to global
  const [activeFilter, setActiveFilter] = useState('all');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard();
  }, [activeFilter]);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to fetch profile in ranking', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(activeFilter);
      const list = Array.isArray(data) ? data : [];
      setRankingData(list.map((u: any, i: number) => ({ ...u, rank: i + 1 })));
    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar ranking.');
    } finally {
      setLoading(false);
    }
  };

  const top3 = rankingData.slice(0, 3);
  const restOfList = rankingData.slice(3);

  // Find current user's rank in the full list
  const currentUserRankData = rankingData.find(u => u.id === currentUser?.id);
  const isCurrentUserInTop10 = currentUserRankData && currentUserRankData.rank <= 10;

  return (
    <div className="min-h-full relative bg-background-light dark:bg-background-dark">
      <header className="pt-6 px-4 lg:px-10 z-20 relative bg-surface-light/80 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-display font-bold text-secondary dark:text-white flex items-center gap-2">
            <Trophy className="text-primary" size={24} /> Ranking Global
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <Calendar size={14} />
            <span>Período: <span className="font-bold text-primary">{FILTERS.find(f => f.id === activeFilter)?.label}</span></span>
          </div>
        </div>

        {/* Temporal Filters - Visual only for now if backend support limited */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide items-center">
          <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all transform active:scale-95 ${activeFilter === filter.id
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-10 pb-20 z-10 relative custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto mt-8">
            {/* Podium Skeleton */}
            <div className="flex justify-center items-end gap-2 sm:gap-6 mb-10 w-full max-w-2xl mx-auto">
              {/* #2 */}
              <div className="flex flex-col items-center flex-1">
                <Skeleton variant="circular" width={64} height={64} className="mb-4 sm:w-20 sm:h-20" />
                <Skeleton variant="text" width={60} height={16} className="mb-2" />
                <Skeleton variant="rectangular" width={40} height={20} className="rounded-full" />
              </div>
              {/* #1 */}
              <div className="flex flex-col items-center flex-1">
                <Skeleton variant="circular" width={80} height={80} className="mb-5 sm:w-28 sm:h-28" />
                <Skeleton variant="text" width={80} height={20} className="mb-2" />
                <Skeleton variant="rectangular" width={60} height={28} className="rounded-full" />
              </div>
              {/* #3 */}
              <div className="flex flex-col items-center flex-1">
                <Skeleton variant="circular" width={64} height={64} className="mb-4 sm:w-20 sm:h-20" />
                <Skeleton variant="text" width={60} height={16} className="mb-2" />
                <Skeleton variant="rectangular" width={40} height={20} className="rounded-full" />
              </div>
            </div>

            {/* List Skeleton */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl shadow-xl w-full border border-gray-100 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
                      <Skeleton variant="circular" width={32} height={32} />
                      <div className="space-y-1">
                        <Skeleton variant="text" width={120} height={16} />
                        <Skeleton variant="text" width={60} height={12} className="md:hidden" />
                      </div>
                    </div>
                    <Skeleton variant="text" width={60} height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Compact Podium */}
            {rankingData.length > 0 && (
              <div className="flex justify-center items-end gap-2 sm:gap-6 mb-12 max-w-2xl mx-auto mt-14 px-2">
                {/* Second Place */}
                {top3[1] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-300 p-0.5 bg-surface-light dark:bg-surface-dark shadow-xl overflow-hidden flex items-center justify-center">
                        {top3[1].avatarUrl ? (
                          <img src={top3[1].avatarUrl} alt={top3[1].name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-gray-400">
                            <Trophy size={24} className="sm:size-32" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-300 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white">#2</div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="text-xs sm:text-sm font-display font-bold text-secondary dark:text-white truncate max-w-[80px] sm:max-w-[120px]">{top3[1].name}</h3>
                      <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-2 sm:px-3 py-0.5 rounded-full mt-1">
                        <span className="text-[10px] sm:text-xs font-bold text-primary">{Math.max(0, top3[1].connectaPoints || top3[1].points || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* First Place */}
                {top3[0] && (
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div className="relative">
                      <Trophy className="text-yellow-400 absolute -top-10 left-1/2 transform -translate-x-1/2 drop-shadow-lg" size={40} />
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-400 p-0.5 bg-surface-light dark:bg-surface-dark shadow-2xl shadow-yellow-400/20 overflow-hidden flex items-center justify-center">
                        {top3[0].avatarUrl ? (
                          <img src={top3[0].avatarUrl} alt={top3[0].name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-yellow-500">
                            <Trophy size={32} className="sm:size-48" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full shadow-lg border border-white">#1</div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-sm sm:text-base font-display font-bold text-secondary dark:text-white truncate max-w-[100px] sm:max-w-[150px]">{top3[0].name}</h3>
                      <div className="inline-flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 px-3 sm:px-4 py-1 rounded-full mt-1">
                        <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">{Math.max(0, top3[0].connectaPoints || top3[0].points || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Third Place */}
                {top3[2] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-sky-300 p-0.5 bg-surface-light dark:bg-surface-dark shadow-xl overflow-hidden flex items-center justify-center">
                        {top3[2].avatarUrl ? (
                          <img src={top3[2].avatarUrl} alt={top3[2].name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sky-400">
                            <Trophy size={24} className="sm:size-32" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-sky-300 text-sky-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white">#3</div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="text-xs sm:text-sm font-display font-bold text-secondary dark:text-white truncate max-w-[80px] sm:max-w-[120px]">{top3[2].name}</h3>
                      <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-2 sm:px-3 py-0.5 rounded-full mt-1">
                        <span className="text-[10px] sm:text-xs font-bold text-primary">{Math.max(0, top3[2].connectaPoints || top3[2].points || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Refactored List (Mobile-First) */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-surface-darker/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                <div className="col-span-1 text-center">Pos</div>
                <div className="col-span-6">Estudante</div>
                <div className="col-span-3">Nível</div>
                <div className="col-span-2 text-right text-primary">🪙</div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {restOfList.length === 0 && rankingData.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">Nenhum dado de ranking disponível.</div>
                ) : restOfList.map((student) => {
                  const isMe = student.id === currentUser?.id;
                  return (
                    <div key={student.id} className={`grid grid-cols-12 items-center gap-4 p-4 transition-colors ${isMe ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                      <div className="col-span-1 flex justify-center">
                        <span className={`font-black text-xs h-7 w-7 flex items-center justify-center rounded-lg ${isMe ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          {student.rank}
                        </span>
                      </div>
                      <div className="col-span-8 sm:col-span-6 flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden flex-shrink-0">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-gray-400 uppercase font-bold text-xs">
                              {student.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm sm:text-base font-bold truncate ${isMe ? 'text-primary' : 'text-secondary dark:text-white'}`}>
                            {student.name} {isMe && '(Você)'}
                          </span>
                          <span className="sm:hidden text-[10px] text-gray-400 font-medium">{student.tier?.name || 'Iniciante'}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block col-span-3 text-sm text-gray-500 dark:text-gray-400">
                        {student.tier?.name || 'Iniciante'}
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-right">
                        <span className="font-black text-primary text-sm sm:text-base">{Math.max(0, student.connectaPoints || student.points || 0)}</span>
                        <span className="block text-[8px] font-bold text-gray-400 sm:hidden">🪙</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky "My Rank" Bar */}
            {currentUserRankData && !isCurrentUserInTop10 && (
              <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lg z-30 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-primary text-white shadow-2xl shadow-primary/40 rounded-2xl p-4 flex items-center justify-between border border-white/20 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 h-10 w-10 flex items-center justify-center font-black text-xl rounded-xl">
                      {currentUserRankData.rank}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Sua Posição</p>
                      <p className="font-bold">{currentUser?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Minha Pontuação</p>
                    <p className="text-xl font-black">{Math.max(0, currentUserRankData.connectaPoints || currentUserRankData.points || 0)} 🪙</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RankingScreen;