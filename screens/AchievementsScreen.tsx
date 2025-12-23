import React from 'react';
import { Award, Rocket, Users, Bug } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';

const IconsMap: any = {
  Award, Rocket, Users, Bug
};

const AchievementsScreen = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-none p-6 md:px-8 z-10">
        <h1 className="text-2xl font-display font-bold text-secondary dark:text-white">Galeria de Conquistas</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-sky-500 rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sky-100 text-sm font-medium mb-1">Total de Conquistas</p>
                <h3 className="text-4xl font-display font-bold">12 <span className="text-xl font-normal text-sky-200">/ 45</span></h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Award size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-sky-100 mb-2">
                <span>Progresso Global</span>
                <span>26%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "26%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = IconsMap[achievement.icon] || Award;
            return (
              <div key={achievement.id} className={`group bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border-2 ${achievement.unlocked ? 'border-primary/20 hover:border-primary' : 'border-gray-200 dark:border-gray-700 opacity-60'} shadow-sm relative overflow-hidden transition-all`}>
                {achievement.unlocked && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full p-1 w-6 h-6">
                      <span className="text-green-500 text-xs font-bold">✓</span>
                    </span>
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.unlocked ? achievement.color : 'from-gray-300 to-gray-400'} flex items-center justify-center text-white shadow-lg mb-4`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;