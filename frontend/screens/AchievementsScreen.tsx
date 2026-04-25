import React, { useState } from 'react';
import { Award, Trophy, Palette, Medal, LucideIcon } from 'lucide-react';
import AchievementsTab from '../components/AchievementsTab';
import ArtsTab from '../components/ArtsTab';
import HallOfFameTab from '../components/HallOfFameTab';
import { PageHero } from '../components/ui';
import { cn } from '../utils/cn';

type TabId = 'hall_of_fame' | 'achievements' | 'arts';

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'hall_of_fame', label: 'Hall da Fama 2026', icon: Trophy },
  { id: 'achievements', label: 'Minhas Conquistas', icon: Medal },
  { id: 'arts', label: 'Artes de Destaque', icon: Palette },
];

const AchievementsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabId>('hall_of_fame');

  const heroMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={heroMeta?.icon || Award}
        tagLabel={
          activeTab === 'hall_of_fame'
            ? 'Imortalize-se na comunidade Connecta'
            : activeTab === 'achievements'
            ? 'Sua trajetória em medalhas'
            : 'Arte & Criatividade dos projetos'
        }
        title={
          activeTab === 'hall_of_fame'
            ? 'Hall da Fama'
            : activeTab === 'achievements'
            ? 'Galeria de Conquistas'
            : 'Artes de Destaque'
        }
        description={
          activeTab === 'hall_of_fame'
            ? 'Reconhecimento dos estudantes que se destacaram em colaboração, consistência e impacto.'
            : activeTab === 'achievements'
            ? 'Acompanhe seu progresso e desbloqueie novas recompensas ao longo da sua jornada Connecta.'
            : 'Curadoria das melhores peças criativas produzidas nos projetos da comunidade.'
        }
        actionButtons={
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100/70 p-1 shadow-inner dark:border-gray-700 dark:bg-white/5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all sm:px-4',
                  activeTab === tab.id
                    ? 'bg-surface-light text-secondary shadow-md dark:bg-surface-dark dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <tab.icon size={12} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="w-full">
        {activeTab === 'hall_of_fame' && <HallOfFameTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'arts' && <ArtsTab />}
      </div>
    </div>
  );
};

export default AchievementsScreen;
