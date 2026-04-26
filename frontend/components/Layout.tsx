import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';
import {
    LayoutDashboard,
    FolderOpen,
    Trophy,
    Medal,
    Calendar,
    CheckSquare,
    Rocket,
    Menu,
    Bell,
    Sun,
    Moon,
    Network,
    LogOut,
    User,
    Briefcase
} from 'lucide-react';
import logo from '../assets/logo.webp';
import { getProfile } from '../services/user.service';
import { Skeleton } from './Skeleton';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first, then system preference
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active?: boolean }) => {
    const location = useLocation();
    const isActive = active !== undefined ? active : (location.pathname === to || location.pathname.startsWith(to + '/'));

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
          ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-darker hover:text-primary dark:hover:text-primary'
                }
      `}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
};

const SidebarSubItem = ({ to, label }: { to: string; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                ${isActive
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5'
                }
            `}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`} />
            <span className="text-xs uppercase tracking-widest font-black">{label}</span>
        </Link>
    );
};

const BottomNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-1.5 transition-all duration-300 relative
                ${isActive ? 'text-primary scale-105' : 'text-gray-500 dark:text-gray-400'}
            `}
        >
            <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
            {isActive && (
                <div className="absolute -top-1 w-12 h-1 bg-primary rounded-full blur-[2px] opacity-40 shadow-[0_0_8px_rgba(3,169,244,0.5)]" />
            )}
        </Link>
    );
};

const Layout = () => {
    // const { isLoaded, userId, signOut } = useAuth();
    const isLoaded = true;
    const userId = localStorage.getItem('token') ? 'local-user' : null;
    const signOut = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoaded) return;

        if (!userId) {
            // If Clerk is loaded but no user, strictly redirect to login
            // However, we should be careful not to conflict with public routes if any.
            // But Layout usually covers protected routes.
            // Let's rely on the api.ts interceptor or this check.
            // For now, if no userId, we can't fetch profile.
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const userData = await getProfile();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();

        // Listener para atualizar pontos instantaneamente
        const handlePointsUpdated = () => {
            if (userId) fetchUser();
        };
        window.addEventListener('pointsUpdated', handlePointsUpdated);

        return () => {
            window.removeEventListener('pointsUpdated', handlePointsUpdated);
        };
    }, [location.pathname, isLoaded, userId]); // Recarrega quando a rota muda or auth state changes

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                {/* Simple Loader */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden">

            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:flex w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 flex-col sticky top-0 h-screen">
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-2 cursor-pointer p-2 rounded-md bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-300" onClick={() => navigate('/dashboard')}>
                        <img src={logo} alt="ConnectaCI Logo" className="h-7 w-auto rounded-xl shadow-sm" />
                        <span className="font-display font-bold text-lg text-secondary dark:text-white tracking-tight">Connecta<span className="text-primary">Hub</span></span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/projects" icon={FolderOpen} label="Projetos" />
                    <SidebarItem to="/groups" icon={Network} label="Grupos" />
                    <SidebarItem to="/jobs" icon={Briefcase} label="Vagas" />
                    <SidebarItem to="/achievements" icon={Medal} label="Conquistas" />
                    <SidebarItem to="/activities" icon={Calendar} label="Atividades" />
                    <SidebarItem to="/profile" icon={User} label="Perfil" />

                    {user?.role === 'ADMIN' && (
                        <>
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Administração</p>
                            <SidebarItem to="/admin/users" icon={User} label="Pessoas" />
                            <SidebarItem to="/admin/projects" icon={FolderOpen} label="Projetos Admin" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group text-left"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-sky-400 p-0.5">
                            <div className="w-full h-full rounded-full bg-white dark:bg-surface-dark flex items-center justify-center overflow-hidden">
                                {loading ? (
                                    <Skeleton variant="circular" width="100%" height="100%" />
                                ) : user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            {loading ? (
                                <>
                                    <Skeleton variant="text" width={100} height={16} className="mb-1" />
                                    <Skeleton variant="text" width={80} height={12} />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-secondary dark:text-white truncate">{user?.name || 'Visitante'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {typeof user?.tier === 'object' ? user.tier.name : (user?.tier || 'Iniciante')} • {user?.connectaPoints || 0} 🪙
                                    </p>
                                </>
                            )}
                        </div>
                        <div
                            role="button"
                            onClick={async (e) => {
                                e.stopPropagation();
                                await signOut();
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                navigate('/');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <LogOut size={16} />
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen">
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <img src={logo} alt="Logo" className="h-7 w-auto rounded-xl" />
                            <span className="font-display font-bold text-lg text-secondary dark:text-white">Connecta<span className="text-primary">Hub</span></span>
                        </div>

                        {!loading && user && (
                            <div className="hidden sm:flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                                <h1 className="text-xl font-display font-bold text-secondary dark:text-white">
                                    Olá, <span className="text-primary">{user.name?.split(' ')[0]}</span>!
                                </h1>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/activities')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 relative group"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white dark:border-surface-dark"></span>
                        </button>
                        
                        <a
                            href="https://discord.gg/NfJe4vUdAj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#5865F2] px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-[#5865F2]/20 transition-all hover:scale-105 hover:bg-[#4752C4] active:scale-95 group"
                            title="Comunidade Discord"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span className="hidden sm:inline">Discord</span>
                        </a>
                        {/* <ThemeToggle /> */}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar bg-background-light dark:bg-background-dark pb-20 md:pb-0">
                    <Outlet />
                </main>

                {/* Bottom Navigation - Mobile Only */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 z-50">
                    <BottomNavItem to="/dashboard" icon={LayoutDashboard} label="Home" />
                    <BottomNavItem to="/projects" icon={FolderOpen} label="Projetos" />
                    <BottomNavItem to="/groups" icon={Network} label="Grupos" />
                    <BottomNavItem to="/jobs" icon={Briefcase} label="Vagas" />
                    <BottomNavItem to="/profile" icon={User} label="Perfil" />
                </nav>
            </div>
        </div>
    );
};

export default Layout;