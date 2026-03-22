import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Lock, Crown, Award } from 'lucide-react';

interface Winner {
  position: number;
  points: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    avatarColor?: string;
    tier?: any; // ou a tipagem correta de tier
  };
  postImageUrl: string | null;
}

interface WeekSlot {
  week: number;
  status: 'pending' | 'calculated';
  winners: Winner[] | null;
}

const HallOfFameTab = () => {
  const [slots, setSlots] = useState<WeekSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchHallOfFame = async () => {
      try {
        const response = await api.get(`/ranking/hall-of-fame?year=${currentYear}`);
        if (response.data?.status === 'success') {
          setSlots(response.data.data.hallOfFame);
        }
      } catch (error) {
        console.error('Erro ao buscar o Hall da Fama:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHallOfFame();
  }, [currentYear]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Carregando as lendas do Connecta...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Hall da Fama {currentYear}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Os 52 maiores pontuadores do ano eternizados para sempre. Apenas um campeão por semana.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {slots.map((slot) => {
          const top1 = slot.winners?.find(w => w.position === 1);

          if (slot.status === 'calculated' && top1) {
            return (
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
          }

          // Slot não atingido / Pendente
          return (
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
        })}
      </div>
    </div>
  );
};

export default HallOfFameTab;
