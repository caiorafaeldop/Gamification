import React, { useEffect, useState } from 'react';
import {
  Rocket, Award, Zap, Brain, Users, Bug, MessageSquare, Flame,
  Search, Check, Lock, Trophy, Medal, Star, Target
} from 'lucide-react';
import { getAchievements, getMyAchievements } from '../services/achievement.service';
import { getProfile } from '../services/user.service';
import { Achievement, UserAchievement, User } from '../types';
import { Skeleton } from '../components/Skeleton';

// Map icons from database string or ID to Lucide components
const IconsMap: any = {
  rocket_launch: Rocket,
  workspace_premium: Medal,
  bolt: Zap,
  psychology: Brain,
  groups: Users,
  pest_control: Bug,
  forum: MessageSquare,
  whatshot: Flame,
  military_tech: Medal,
  emoji_events: Trophy,
  local_fire_department: Flame,
  // Fallbacks
  Award, Rocket, Users, Bug, Zap, Sword: Zap, Crown: Trophy, Star, Target
};

const AchievementsScreen = () => {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all'); // simplified 'in_progress' to locked for now as we lack progress data
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, my, userProfile] = await Promise.all([
          getAchievements(),
          getMyAchievements(),
          getProfile()
        ]);
        setAllAchievements(all);
        setUserAchievements(my);
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to load achievements data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-background-light dark:bg-background-dark relative">
        <div className="absolute inset-0 z-0 bg-network-pattern opacity-[0.03] pointer-events-none"></div>

        {/* Header Skeleton */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-surface-light/80 dark:bg-surface-dark/80 glass-effect z-20">
          <Skeleton className="h-8 w-64" />
        </header>

        <div className="p-4 md:p-8 relative z-10">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>

          {/* Filters & Search Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-2 p-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
          </div>

          {/* Achievements Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
  const unlockedCount = userAchievements.length;
  const totalAchievements = allAchievements.length;
  const progressPercent = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  // Filter logic
  const filteredAchievements = allAchievements.filter(ach => {
    const matchesSearch = ach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isUnlocked = unlockedIds.has(ach.id);

    if (!matchesSearch) return false;

    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  // Helper to get formatted date
  const getUnlockedDate = (achievementId: string) => {
    const ua = userAchievements.find(u => u.achievementId === achievementId);
    if (!ua) return null;
    return new Date(ua.earnedAt).toLocaleDateString();
  };

  // Helper for badge style based on points (simple heuristic for Rarity)
  const getRarityBadge = (points: number) => {
    if (points >= 500) return { label: 'Lendário', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
    if (points >= 200) return { label: 'Raro', color: 'text-gold bg-gold/10' };
    if (points >= 100) return { label: 'Épico', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' };
    return { label: 'Comum', color: 'text-primary bg-primary/10' };
  };

  const rareCount = allAchievements.filter(a => a.points >= 200 && unlockedIds.has(a.id)).length;

  return (
    <div className="min-h-full bg-background-light dark:bg-background-dark relative">
      <div className="absolute inset-0 z-0 bg-network-pattern opacity-[0.03] pointer-events-none"></div>

      {/* Header */}
      <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-surface-light/80 dark:bg-surface-dark/80 glass-effect z-20">
        <h1 className="text-2xl font-display font-bold text-secondary dark:text-white">Galeria de Conquistas</h1>
        <div className="flex items-center gap-4">
          {/* User profile could go here if not in Layout, adding simple display if needed, but keeping clean for now matching layout */}
        </div>
      </header>

      <div className="p-4 md:p-8 relative z-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Card */}
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total de Conquistas</p>
                <h3 className="text-4xl font-display font-bold">{unlockedCount} <span className="text-xl font-normal text-blue-200">/ {totalAchievements}</span></h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Trophy size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-blue-100 mb-2">
                <span>Progresso Global</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Connecta Points</p>
                <p className="text-2xl font-bold text-secondary dark:text-white">{user?.connectaPoints || 0} XP</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Você está no top <strong className="text-green-500">5%</strong> dos alunos esta semana! Continue assim.</p>
          </div>

          {/* Rare Medals Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                <Medal size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Medalhas Raras</p>
                <p className="text-2xl font-bold text-secondary dark:text-white">{rareCount}</p>
              </div>
            </div>
            <div className="flex -space-x-3">
              {/* Mockup bubbles for visual consistency */}
              <div className="w-8 h-8 rounded-full bg-gold border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">G</div>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">P</div>
              <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">E</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex bg-surface-light dark:bg-surface-dark p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >Todas</button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === 'unlocked' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >Desbloqueadas</button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === 'locked' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
            >Bloqueadas</button>
          </div>
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-2.5 text-gray-400"><Search size={20} /></span>
            <input
              className="pl-10 pr-4 py-2 rounded-xl border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark text-sm focus:ring-primary focus:border-primary dark:text-white w-full outline-none transition-all"
              placeholder="Buscar conquista..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const IconComponent = (achievement.icon && IconsMap[achievement.icon]) ? IconsMap[achievement.icon] : Award;
            const unlockDate = getUnlockedDate(achievement.id);
            const rarity = getRarityBadge(achievement.points);

            return (
              <div key={achievement.id} className={`achievement-card group bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border-2 ${isUnlocked ? 'border-primary/20 hover:border-primary' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'} shadow-sm relative overflow-hidden transition-all duration-300`}>
                {isUnlocked && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full p-1 w-6 h-6">
                      <Check size={14} className="text-green-500" />
                    </span>
                  </div>
                )}
                {!isUnlocked && (
                  <div className="absolute top-0 right-0 p-4">
                    <Lock size={20} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${isUnlocked ? `bg-gradient-to-br ${achievement.color || 'from-primary to-blue-600'} text-white shadow-lg` : 'bg-gray-50 dark:bg-surface-darker text-gray-300 dark:text-gray-600 grayscale group-hover:grayscale-0'}`}>
                  <IconComponent size={32} />
                </div>

                <h3 className={`text-lg font-bold mb-2 transition-colors ${isUnlocked ? 'text-secondary dark:text-white group-hover:text-primary' : 'text-gray-500 dark:text-gray-400'}`}>{achievement.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{achievement.description}</p>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${rarity.color}`}>{rarity.label}</span>
                  <span className="text-xs text-gray-400">{isUnlocked ? unlockDate : 'Bloqueado'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;