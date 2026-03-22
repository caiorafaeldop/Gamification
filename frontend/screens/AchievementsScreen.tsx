import React, { useState } from 'react';
import AchievementsTab from '../components/AchievementsTab';
import ArtsTab from '../components/ArtsTab';
import HallOfFameTab from '../components/HallOfFameTab';

const AchievementsScreen = () => {
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'achievements' | 'arts'>('hall_of_fame');

  return (
    <div className="min-h-full bg-background-light dark:bg-background-dark relative flex flex-col">
      <div className="absolute inset-0 z-0 bg-network-pattern opacity-[0.03] pointer-events-none"></div>

      {/* Header with integrated tabs */}
      <header className="pt-6 px-6 border-b border-gray-200 dark:border-gray-800 bg-surface-light/80 dark:bg-surface-dark/80 glass-effect z-20 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-secondary dark:text-white">Galeria de Conquistas</h1>
        </div>
        
        <div className="flex gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-xl w-max shadow-inner mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hall_of_fame')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'hall_of_fame' 
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Hall da Fama 2026
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'achievements' 
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Minhas Conquistas
          </button>
          <button
            onClick={() => setActiveTab('arts')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'arts' 
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Artes de Destaque
          </button>
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col">
         {activeTab === 'hall_of_fame' && <HallOfFameTab />}
         {activeTab === 'achievements' && <AchievementsTab />}
         {activeTab === 'arts' && <ArtsTab />}
      </div>
    </div>
  );
};

export default AchievementsScreen;