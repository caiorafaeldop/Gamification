import React, { useMemo } from 'react';
import { Lock, Crown, Award, Calendar } from 'lucide-react';
import { useHallOfFame } from '../hooks/useRanking';

interface Winner {
  position: number;
  points: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    avatarColor?: string;
    tier?: any;
  };
  postImageUrl: string | null;
}

type WeekSlot = {
  week: number;
  status: 'pending' | 'calculated';
  winners: Winner[] | null;
};

// Mapeamento de semana -> mês (aproximado, baseado no início de cada mês em 2026)
const MONTH_START_WEEKS_2026: Record<number, string> = {
  1: 'Janeiro',
  5: 'Fevereiro',
  9: 'Março',
  14: 'Abril',
  18: 'Maio',
  22: 'Junho',
  27: 'Julho',
  31: 'Agosto',
  36: 'Setembro',
  40: 'Outubro',
  44: 'Novembro',
  48: 'Dezembro',
};

// Para anos genéricos, estimativa simples
function getMonthLabel(weekNumber: number, year: number): string | null {
  if (year === 2026) {
    return MONTH_START_WEEKS_2026[weekNumber] || null;
  }
  // Genérico: mês muda a cada ~4.33 semanas
  const monthStarts: Record<number, string> = {
    1: 'Janeiro', 5: 'Fevereiro', 9: 'Março', 14: 'Abril',
    18: 'Maio', 22: 'Junho', 27: 'Julho', 31: 'Agosto',
    36: 'Setembro', 40: 'Outubro', 44: 'Novembro', 48: 'Dezembro',
  };
  return monthStarts[weekNumber] || null;
}

const HallOfFameTab = () => {
  const currentYear = new Date().getFullYear();
  const { data, isLoading: loading } = useHallOfFame(currentYear);
  const slots = (data ?? []) as WeekSlot[];

  // Filtrar slots: Em 2026, começa a partir da semana 9 (Março)
  const filteredSlots = useMemo(() => {
    if (currentYear === 2026) {
      return slots.filter(s => s.week >= 9);
    }
    return slots;
  }, [slots, currentYear]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Carregando as lendas do Connecta...</p>
      </div>
    );
  }

  // Agrupar slots por mês para renderizar com marcadores
  const renderSlotsWithMonthMarkers = () => {
    const elements: React.ReactNode[] = [];
    let lastMonth: string | null = null;

    filteredSlots.forEach((slot) => {
      const monthLabel = getMonthLabel(slot.week, currentYear);

      if (monthLabel && monthLabel !== lastMonth) {
        lastMonth = monthLabel;
        elements.push(
          <div key={`month-${monthLabel}`} className="col-span-full">
            <div className="flex items-center gap-3 py-3 mt-4 first:mt-0">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-primary dark:text-blue-400">{monthLabel}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
            </div>
          </div>
        );
      }

      const top1 = slot.winners?.find(w => w.position === 1);

      if (slot.status === 'calculated' && top1) {
        elements.push(
          <div 
            key={`week-${slot.week}`}
            className="relative group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-900 flex flex-col items-center justify-center aspect-square hover:shadow-md transition-all cursor-pointer"
            title={`Vencedor da Semana ${slot.week}: ${top1.user.name} com ${top1.points}XP`}
          >
            <div className="absolute top-2 left-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-500 text-xs font-bold px-2 py-1 rounded-full">
              Sem {slot.week}
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mb-3 border-2 border-yellow-400 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                {top1.user.avatarUrl ? (
                  <img src={top1.user.avatarUrl} alt={top1.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xl font-bold">
                    {top1.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 text-center truncate w-full">
              {top1.user.name.split(' ')[0]}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600 dark:text-yellow-500 font-semibold">
              <Award className="w-3 h-3" />
              {top1.points} XP
            </div>
          </div>
        );
      } else {
        elements.push(
          <div 
            key={`week-${slot.week}`}
            className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-4 shadow-sm border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center aspect-square opacity-70"
          >
            <div className="text-gray-400 dark:text-gray-600 text-xs font-medium mb-2">
              Semana {slot.week}
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Bloqueado
            </span>
          </div>
        );
      }
    });

    return elements;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-primary dark:text-blue-400 flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Hall da Fama {currentYear}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Os maiores pontuadores do ano eternizados para sempre. Apenas um campeão por semana.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {renderSlotsWithMonthMarkers()}
      </div>
    </div>
  );
};

export default HallOfFameTab;
