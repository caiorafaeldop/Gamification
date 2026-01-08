import React, { useEffect, useState, useMemo } from 'react';
import { 
  Award, Rocket, Users, Bug, Zap, Brain, MessageSquare, Flame, 
  Check, Lock, Search, Target, Medal, Crown, Star 
} from 'lucide-react';
import { getAchievements, getMyAchievements } from '../services/achievement.service';
import { Achievement, UserAchievement } from '../types';
import { useAuth } from '../hooks/useAuth';

// Map Material Icons names (from HTML) or logical concepts to Lucide
const IconsMap: any = {
  rocket_launch: Rocket,
  workspace_premium: Award,
  bolt: Zap,
  psychology: Brain,
  groups: Users,
  pest_control: Bug,
  forum: MessageSquare,
  whatshot: Flame,
  Rocket, Award, Zap, Brain, Users, Bug, MessageSquare, Flame, // Fallbacks
  local_fire_department: Flame,
  military_tech: Medal,
  emoji_events: Crown
};

const AchievementsScreen = () => {
  const { user } = useAuth();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, my] = await Promise.all([
          getAchievements(),
          getMyAchievements()
        ]);
        setAllAchievements(all);
        setUserAchievements(my);
      } catch (error) {
        console.error('Failed to load achievements', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalAchievements = allAchievements.length;
  const unlockedCount = userAchievements.length;
  const progressPercent = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;
  
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  // Logic to determine if an achievement is "in progress"
  // Since backend doesn't give partial progress on individual cheevos yet, 
  // we can use the criteria "xp_TARGET" to simulate it.
  const getProgress = (ach: Achievement) => {
    if (unlockedIds.has(ach.id)) return 100;
    if (ach.criteria?.startsWith('xp_')) {
      const target = parseInt(ach.criteria.split('_')[1]);
      if (user?.connectaPoints && target > 0) {
        const p = Math.min(100, Math.round((user.connectaPoints / target) * 100));
        return p;
      }
    }
    return 0;
  };

  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(ach => {
      const matchesSearch = ach.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ach.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const isUnlocked = unlockedIds.has(ach.id);
      const progress = getProgress(ach);
      // Rough "in progress" definition: not unlocked, but has some progress OR is specifically marked so?
      // For now, "in_progress" = > 0% and < 100% (unlocked).
      // But purely XP ones work this way. Others are 0 or 100.
      const isInProgress = !isUnlocked && progress > 0;

      if (filter === 'unlocked') return isUnlocked;
      if (filter === 'locked') return !isUnlocked;
      if (filter === 'in_progress') return isInProgress;
      
      return true;
    });
  }, [allAchievements, unlockedIds, filter, searchQuery, user]);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
     );
  }

  return (
    <div className="min-h-full flex flex-col relative w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-network-pattern opacity-[0.03] pointer-events-none sticky top-0 h-screen"></div>

      {/* Page Header - Sticky */}
      <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-bold text-secondary dark:text-white">Galeria de Conquistas</h1>
        </div>
        <div className="flex items-center gap-4">
           {/* Removing redundant ThemeToggle since Layout has it, but keeping User Profile as requested */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Estudante'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.course || 'Connecta Member'}</p>
            </div>
            {user?.avatarColor ? (
               <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-white font-bold bg-${user.avatarColor}-500`}>
                 {user.name?.charAt(0)}
               </div>
            ) : (
               <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm bg-gray-300 flex items-center justify-center">
                  <Users size={20} className="text-gray-500" />
               </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 p-4 md:p-8 relative z-10">
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Main Progress Card */}
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total de Conquistas</p>
                <h3 className="text-4xl font-display font-bold">{unlockedCount} <span className="text-xl font-normal text-blue-200">/ {totalAchievements}</span></h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Crown size={28} className="text-white" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-blue-100 mb-2">
                <span>Progresso Global</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Connecta Points</p>
                <p className="text-2xl font-bold text-secondary dark:text-white">{user?.connectaPoints || 0} XP</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Continue completando tarefas para subir no Ranking e ganhar destaque!
            </p>
          </div>

          {/* Rare Medals (Mocked/Placeholder for now as logic implies rarity) */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
             <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                <Medal size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Conquistas Raras</p>
                <p className="text-2xl font-bold text-secondary dark:text-white">{unlockedCount > 5 ? Math.floor(unlockedCount / 5) : 0}</p>
              </div>
            </div>
            <div className="flex -space-x-3">
               {/* Decorative circles to match design */}
               <div className="w-8 h-8 rounded-full bg-gold border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">G</div>
               <div className="w-8 h-8 rounded-full bg-primary border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">P</div>
               <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] font-bold text-white shadow-sm">E</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
           <div className="flex bg-surface-light dark:bg-surface-dark p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
             {[
               { id: 'all', label: 'Todas' },
               { id: 'unlocked', label: 'Desbloqueadas' },
               { id: 'in_progress', label: 'Em Progresso' },
               { id: 'locked', label: 'Bloqueadas' }
             ].map(opt => (
               <button
                 key={opt.id}
                 onClick={() => setFilter(opt.id as any)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                   filter === opt.id 
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                 }`}
               >
                 {opt.label}
               </button>
             ))}
           </div>

           <div className="relative w-full sm:w-auto">
             <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 dark:text-white w-full sm:w-64 transition-all"
               placeholder="Buscar conquista..."
             />
           </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
           {filteredAchievements.map((ach) => {
             const isUnlocked = unlockedIds.has(ach.id);
             const progress = getProgress(ach);
             
             // Dynamic Icon mapping
             // Try to find icon in IconsMap, else default to Award
             const IconComponent = (ach.icon && IconsMap[ach.icon]) ? IconsMap[ach.icon] : Award;
             
             // Dynamic Gradient
             // If unlocked, use specific color or default gradient
             // If locked, simplify
             // Note: ach.color usually stores something like 'from-blue-400 to-indigo-500' if rich data
             const bgGradient = isUnlocked 
                ? (ach.color ? `bg-gradient-to-br ${ach.color}` : 'bg-gradient-to-br from-primary to-blue-600') 
                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10';

             const iconColor = isUnlocked ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary';

             return (
               <div 
                 key={ach.id} 
                 className={`group bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col h-full
                    ${isUnlocked 
                      ? 'border-primary/20 hover:border-primary shadow-sm hover:transform hover:-translate-y-1' 
                      : 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'
                    }
                 `}
               >
                  {/* Unlocked Badge */}
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 p-3">
                       <span className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full p-1 w-6 h-6">
                         <Check size={14} className="text-green-600 dark:text-green-400 stroke-[3]" />
                       </span>
                    </div>
                  )}

                  {/* Locked Badge */}
                  {!isUnlocked && (
                     <div className="absolute top-0 right-0 p-4">
                        <Lock size={18} className="text-gray-300 dark:text-gray-600" />
                     </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${bgGradient} ${isUnlocked ? 'shadow-lg shadow-primary/30' : ''}`}>
                     <IconComponent size={32} className={`${iconColor} ${isUnlocked ? '' : 'transition-colors'}`} />
                  </div>

                  <h3 className={`text-lg font-bold mb-2 transition-colors ${isUnlocked ? 'text-secondary dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-secondary dark:group-hover:text-white'}`}>
                    {ach.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                    {ach.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 w-full">
                    {isUnlocked ? (
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Desbloqueada</span>
                          {ach.points > 0 && <span className="text-xs font-bold text-primary">{ach.points} XP</span>}
                       </div>
                    ) : (
                       <div className="w-full">
                          {ach.criteria?.startsWith('xp_') && (
                             <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-semibold text-primary">Em progresso</span>
                                  <span className="text-gray-500">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                             </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                             <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Bloqueada</span>
                             {ach.points > 0 && <span className="text-xs font-bold text-gray-400">{ach.points} XP</span>}
                          </div>
                       </div>
                    )}
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