import React, { useState } from 'react';
import { Award, Trophy, Palette, Medal, LucideIcon } from 'lucide-react';
import AchievementsTab from '../components/AchievementsTab';
import ArtsTab from '../components/ArtsTab';
import HallOfFameTab from '../components/HallOfFameTab';
import RankingTab from '../components/RankingTab';
import { PageHero } from '../components/ui';
import { cn } from '../utils/cn';

type TabId = 'ranking' | 'hall_of_fame' | 'achievements' | 'arts';

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'ranking', label: 'Ranking Global', icon: Trophy },
  { id: 'hall_of_fame', label: 'Hall da Fama 2026', icon: Award },
  { id: 'achievements', label: 'Minhas Conquistas', icon: Medal },
  { id: 'arts', label: 'Artes de Destaque', icon: Palette },
];

const AchievementsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabId>('ranking');

  const heroMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={heroMeta?.icon || Award}
        tagLabel={
          activeTab === 'ranking'
            ? 'Arena de Performance'
            : activeTab === 'hall_of_fame'
            ? 'Imortalize-se na comunidade Connecta'
            : activeTab === 'achievements'
            ? 'Sua trajetória em medalhas'
            : 'Arte & Criatividade dos projetos'
        }
        title={
          activeTab === 'ranking'
            ? 'Ranking Global'
            : activeTab === 'hall_of_fame'
            ? 'Hall da Fama'
            : activeTab === 'achievements'
            ? 'Galeria de Conquistas'
            : 'Artes de Destaque'
        }
        description={
          activeTab === 'ranking'
            ? 'Consolide sua jornada e compare-se com a elite. Sua posição reflete dedicação, colaboração e conquistas.'
            : activeTab === 'hall_of_fame'
            ? 'Reconhecimento dos estudantes que se destacaram em colaboração, consistência e impacto.'
            : activeTab === 'achievements'
            ? 'Acompanhe seu progresso e desbloqueie novas recompensas ao longo da sua jornada Connecta.'
            : 'Curadoria das melhores peças criativas produzidas nos projetos da comunidade.'
        }
        actionButtons={
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-gray-100/70 p-1.5 shadow-inner dark:border-gray-700 dark:bg-white/5 sm:w-80 md:w-96 lg:w-[480px]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab.id
                    ? 'bg-surface-light text-primary shadow-lg dark:bg-surface-dark dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <tab.icon size={14} className={activeTab === tab.id ? 'text-primary' : ''} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="w-full min-h-[400px]">
        {activeTab === 'ranking' && <RankingTab />}
        {activeTab === 'hall_of_fame' && <HallOfFameTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'arts' && <ArtsTab />}
      </div>
    </div>
  );
};

export default AchievementsScreen;
