import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Rocket, Users, Target, ArrowLeft, Star, Heart, CheckCircle, Calendar, ListTodo, CheckSquare, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjectDetails } from '../services/project.service';
import { registerProjectInterest } from '../services/explore.service';
import { PageHero, EmptyState } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { LikeButton } from '../components/LikeButton';
import toast from 'react-hot-toast';

const ProjectLandingScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [interestExpressed, setInterestExpressed] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const { data: project, isLoading, error } = useQuery({
        queryKey: ['project-landing', id],
        queryFn: () => getProjectDetails(id!),
        enabled: !!id,
    });

    const interestMutation = useMutation({
        mutationFn: () => registerProjectInterest(id!),
        onSuccess: () => {
            setInterestExpressed(true);
            toast.success('Interesse registrado! O líder foi notificado.', { icon: '🙌' });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erro ao registrar interesse');
        }
    });

    const membersPerPage = 4;
    const totalMembers = project?.members?.length || 0;
    const canGoNext = carouselIndex + membersPerPage < totalMembers;
    const canGoPrev = carouselIndex > 0;

    const nextMembers = React.useCallback(() => {
        const length = project?.members?.length || 0;
        if (carouselIndex + membersPerPage < length) {
            setCarouselIndex(prev => prev + 1);
        } else {
            setCarouselIndex(0);
        }
    }, [carouselIndex, project?.members?.length, membersPerPage]);

    // Auto-play do Carrossel
    React.useEffect(() => {
        if (totalMembers <= membersPerPage) return;
        const timer = setInterval(nextMembers, 5000);
        return () => clearInterval(timer);
    }, [nextMembers, totalMembers, membersPerPage]);


    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1000px] p-4 sm:p-6 lg:p-8 space-y-6">
                <Skeleton height={200} className="rounded-2xl" />
                <Skeleton height={400} className="rounded-2xl" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="mx-auto max-w-[1000px] p-4 sm:p-6 lg:p-8">
                <button 
                    onClick={() => navigate('/projects')} 
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> Voltar para Projetos
                </button>
                <EmptyState icon={Target} title="Projeto não encontrado" description="O projeto pode ter sido removido ou tornado privado." />
            </div>
        );
    }

    const color = project.Group?.color || project.color || '#29B6F6';

    const prevMembers = () => {
        if (canGoPrev) setCarouselIndex(prev => prev - 1);
    };


    return (
        <div className="min-h-full bg-background-light dark:bg-background-dark pb-20">
            <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="relative">
                    {/* Badge de Membros no topo direito */}
                    <div className="absolute top-4 right-4 z-20 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-gray-200 dark:border-white/5 shadow-sm">
                        <Users size={14} style={{ color }} />
                        <span className="text-xs font-black text-secondary dark:text-white">
                            {project._count?.members || project.members?.length || 0}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Membros</span>
                    </div>

                    <PageHero
                        icon={Target}
                        tagLabel={
                            <button 
                                onClick={() => navigate('/projects')}
                                className="group flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 shadow-sm hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mr-2"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                                Voltar para Projetos
                            </button>
                        }
                        title={project.title}
                        description={project.description || "Nenhuma descrição fornecida."}
                        highlight={
                            <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-surface-light/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 overflow-hidden ring-2 ring-white dark:ring-gray-800">
                                    {project.leader?.avatarUrl ? (
                                        <img src={project.leader.avatarUrl} alt={project.leader.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-xs" style={{ color: project.leader?.avatarColor || color }}>
                                            {project.leader?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Líder do Projeto</p>
                                    <p className="text-xs font-bold text-secondary dark:text-white truncate max-w-[100px] leading-none">
                                        {project.leader?.name}
                                    </p>
                                </div>
                            </div>
                        }
                        actionButtons={
                            <>
                                <LikeButton
                                    projectId={id!}
                                    initialLiked={project.liked ?? false}
                                    initialCount={project.likeCount ?? 0}
                                    visibility={project.visibility}
                                    variant="inline"
                                />

                                {project.isJoiningOpen ? (
                                    <button
                                        onClick={() => interestMutation.mutate()}
                                        disabled={interestExpressed || interestMutation.isPending}
                                        className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold w-full sm:w-auto text-white transition-all shadow-sm hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: interestExpressed ? '#10B981' : color }}
                                    >
                                        {interestMutation.isPending ? 'Enviando...' : interestExpressed ? <><CheckCircle size={18} /> Interesse Enviado</> : <><Heart size={18} /> Tenho Interesse</>}
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
                                        Vagas Fechadas
                                    </div>
                                )}

                                {project.Group && (
                                    <button 
                                        onClick={() => navigate(`/groups/${project.Group.id}`)}
                                        className="flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition shadow-sm w-full sm:w-auto"
                                    >
                                        <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
                                            {project.Group.logoUrl ? (
                                                <img src={project.Group.logoUrl} alt={project.Group.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Rocket size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-secondary dark:text-white truncate max-w-[150px]">
                                            {project.Group.name}
                                        </span>
                                    </button>
                                )}
                            </>
                        }
                    />
                </div>

                {/* KPIs com estilo "MedTrack" */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: "#8B5CF6" }} />
                        <div className="relative z-10">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: `#8B5CF615`, border: `1px solid #8B5CF625` }}>
                                <Calendar size={20} style={{ color: "#8B5CF6" }} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Início</p>
                            <p className="text-2xl font-display font-black text-secondary dark:text-white leading-none">
                                {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 font-medium">Data de criação</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: "#3B82F6" }} />
                        <div className="relative z-10">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: `#3B82F615`, border: `1px solid #3B82F625` }}>
                                <ListTodo size={20} style={{ color: "#3B82F6" }} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Missões (Total)</p>
                            <p className="text-2xl font-display font-black text-secondary dark:text-white leading-none">
                                {project.stats?.tasksCount ?? project.tasks?.length ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 font-medium">Tarefas atribuídas</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: "#10B981" }} />
                        <div className="relative z-10">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: `#10B98115`, border: `1px solid #10B98125` }}>
                                <CheckSquare size={20} style={{ color: "#10B981" }} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Concluídas</p>
                            <p className="text-2xl font-display font-black text-secondary dark:text-white leading-none">
                                {project.stats?.tasksCompleted ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 font-medium">Tarefas finalizadas</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: "#F59E0B" }} />
                        <div className="relative z-10">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: `#F59E0B15`, border: `1px solid #F59E0B25` }}>
                                <Zap size={20} style={{ color: "#F59E0B" }} />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Total Points</p>
                            <p className="text-2xl font-display font-black text-secondary dark:text-white leading-none">
                                {project.stats?.totalPoints ?? 0}
                            </p>
                            <p className="text-xs text-amber-500 mt-1.5 font-bold">XP Gerado</p>
                        </div>
                    </div>
                </div>

                {project.members && project.members.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="text-sm font-black text-secondary dark:text-white tracking-widest uppercase">Membros (Top XP)</h3>
                            {totalMembers > membersPerPage && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={prevMembers} 
                                        disabled={!canGoPrev}
                                        className="p-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-500 hover:text-secondary dark:hover:text-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        onClick={nextMembers} 
                                        disabled={!canGoNext}
                                        className="p-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-500 hover:text-secondary dark:hover:text-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                                  <div className="relative overflow-hidden group/carousel">
                            <div 
                                className="flex gap-6 py-4"
                                style={{
                                    width: 'max-content',
                                    animation: totalMembers > 4 ? `scroll-carousel ${totalMembers * 5}s linear infinite` : 'none',
                                }}
                            >
                                <style>{`
                                    @keyframes scroll-carousel {
                                        0% { transform: translateX(0); }
                                        100% { transform: translateX(-50%); }
                                    }
                                `}</style>
                                {(totalMembers > 4 ? [...project.members, ...project.members] : project.members).map((m: any, idx: number) => {
                                    const isTop3 = (idx % totalMembers) < 3 && (m.projectScore > 0 || (idx % totalMembers) === 0);
                                    
                                    const rankStyles = [
                                        { bg: 'from-amber-300 via-yellow-500 to-amber-600', ring: 'ring-amber-400/30' },
                                        { bg: 'from-slate-200 via-slate-400 to-slate-500', ring: 'ring-slate-400/30' },
                                        { bg: 'from-orange-400 via-orange-600 to-orange-700', ring: 'ring-orange-500/30' }
                                    ][idx % totalMembers] || { bg: 'from-gray-400 to-gray-600', ring: 'ring-gray-400/20' };

                                    return (
                                        <div 
                                            key={`${m.user.id}-${idx}`} 
                                            className={`relative group shrink-0 w-[280px] bg-white/80 dark:bg-surface-dark/60 backdrop-blur-xl border border-white dark:border-white/5 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden
                                                ${isTop3 ? 'before:absolute before:inset-0 before:p-[2px] before:rounded-[2rem] before:bg-gradient-to-r ' + rankStyles.bg + ' before:opacity-20 group-hover:before:opacity-100 before:transition-opacity before:-z-10' : ''}
                                            `}
                                        >
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${rankStyles.bg} -z-20`} />
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            {isTop3 && (
                                                <div className={`absolute top-4 left-4 w-7 h-7 rounded-full bg-gradient-to-br ${rankStyles.bg} flex items-center justify-center text-white text-[10px] font-black shadow-lg border-2 border-white dark:border-surface-dark z-20`}>
                                                    {(idx % totalMembers) + 1}
                                                </div>
                                            )}
                                            <div className="relative mb-5">
                                                <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500 bg-gradient-to-tr ${rankStyles.bg}`} />
                                                <div className={`w-20 h-20 rounded-full p-1.5 bg-white dark:bg-gray-800 shadow-inner relative z-10 ring-1 ${rankStyles.ring} group-hover:ring-4 transition-all duration-500`}>
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                                        {m.user.avatarUrl ? (
                                                            <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white shadow-inner" style={{ backgroundColor: m.user.avatarColor || color }}>
                                                                {m.user.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative z-10 w-full mb-4">
                                                <p className="text-sm font-black text-secondary dark:text-white line-clamp-1 group-hover:text-primary transition-colors duration-300">{m.user.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Colaborador</p>
                                            </div>
                                            <div className="mt-auto relative z-10">
                                                <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                                                    <Zap size={12} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                                                    <span className="text-xs font-black text-secondary dark:text-white">
                                                        {m.projectScore ?? 0}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">PTS</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Overlay Gradient para suavizar as bordas do carrossel infinito */}
                            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectLandingScreen;
