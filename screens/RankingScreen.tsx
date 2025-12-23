import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Filter } from 'lucide-react';
import { TOP_STUDENTS } from '../constants';
import { Student } from '../types';

const FILTERS = [
  { id: 'daily', label: 'Diário' },
  { id: '7days', label: 'Últimos 7 dias' },
  { id: 'monthly', label: 'Mensal' },
  { id: '30days', label: 'Últimos 30 dias' },
  { id: '4months', label: 'Últimos 4 meses' },
];

const RankingScreen = () => {
  const [activeFilter, setActiveFilter] = useState('7days');
  const [rankingData, setRankingData] = useState<Student[]>(TOP_STUDENTS);
  const [isAnimating, setIsAnimating] = useState(false);

  // Simulate fetching different data when filter changes
  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => {
      // Create a deterministic "random" variation based on filter just to show UI changes
      // In a real app, this would be an API call
      const multiplierMap: Record<string, number> = {
        'daily': 0.1,
        '7days': 1,
        'monthly': 4,
        '30days': 4.2,
        '4months': 16
      };

      const multiplier = multiplierMap[activeFilter] || 1;

      const newRanking = [...TOP_STUDENTS]
        .map(student => {
          // Add some randomness to shuffle positions
          const randomFactor = 0.9 + Math.random() * 0.2; 
          return {
            ...student,
            points: Math.floor(student.points * multiplier * randomFactor)
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }));

      setRankingData(newRanking);
      setIsAnimating(false);
    }, 400); // Small delay for effect

    return () => clearTimeout(timeout);
  }, [activeFilter]);

  const top3 = rankingData.slice(0, 3);
  const restOfList = rankingData.slice(3);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background-light dark:bg-background-dark">
      <header className="flex-none pt-6 px-4 lg:px-10 z-20 relative bg-surface-light/80 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-display font-bold text-secondary dark:text-white flex items-center gap-2">
            <Trophy className="text-primary" size={24} /> Ranking Global
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
             <Calendar size={14} />
             <span>Período: <span className="font-bold text-primary">{FILTERS.find(f => f.id === activeFilter)?.label}</span></span>
          </div>
        </div>
        
        {/* Temporal Filters */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar no-scrollbar items-center">
            <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            {FILTERS.map(filter => (
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
      </header>
      
      <div className={`flex-1 overflow-y-auto px-4 lg:px-10 pb-10 z-10 relative custom-scrollbar transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end max-w-4xl mx-auto mt-8">
          {/* Second Place */}
          {top3[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center animate-float-delayed transition-all duration-500">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-300 p-1 bg-surface-light dark:bg-surface-dark shadow-xl bg-gray-200"></div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-md border border-white">#2</div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-display font-bold text-secondary dark:text-white">{top3[1].name}</h3>
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full mt-1">
                <span className="text-sm font-bold text-primary">{top3[1].points}</span>
              </div>
            </div>
          </div>
          )}

          {/* First Place */}
          {top3[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center animate-float transition-all duration-500">
            <div className="relative z-10">
              <Trophy className="text-yellow-400 absolute -top-10 left-1/2 transform -translate-x-1/2 drop-shadow-lg" size={40} />
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400 p-1 bg-surface-light dark:bg-surface-dark shadow-2xl shadow-yellow-400/20 bg-gray-200"></div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-0.5 rounded-full shadow-lg border border-white">#1</div>
            </div>
            <div className="mt-5 text-center relative z-10">
              <h3 className="font-display font-bold text-lg text-secondary dark:text-white">{top3[0].name}</h3>
              <div className="inline-flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 rounded-full mt-1">
                <span className="text-base font-bold text-yellow-600 dark:text-yellow-400">{top3[0].points}</span>
              </div>
            </div>
          </div>
          )}

          {/* Third Place */}
          {top3[2] && (
          <div className="order-3 md:order-3 flex flex-col items-center animate-float-delayed transition-all duration-500">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-sky-300 p-1 bg-surface-light dark:bg-surface-dark shadow-xl bg-gray-200"></div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-sky-300 text-sky-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-md border border-white">#3</div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-display font-bold text-secondary dark:text-white">{top3[2].name}</h3>
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full mt-1">
                <span className="text-sm font-bold text-primary">{top3[2].points}</span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* List Table */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-gray-100 dark:border-gray-700 max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-surface-darker/50">
                  <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center w-20">Pos</th>
                  <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Estudante</th>
                  <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Curso</th>
                  <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Pontos (CP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {restOfList.map((student) => (
                  <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-5 text-center">
                        <span className="font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 w-8 h-8 flex items-center justify-center rounded-lg text-sm">{student.rank}</span>
                    </td>
                    <td className="p-5 font-semibold text-secondary dark:text-white flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                         {student.name}
                    </td>
                    <td className="p-5 text-sm text-gray-500 dark:text-gray-400">{student.course}</td>
                    <td className="p-5 text-right font-black text-primary">{student.points}</td>
                  </tr>
                ))}
                {restOfList.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">
                            Nenhum estudante encontrado neste filtro.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingScreen;