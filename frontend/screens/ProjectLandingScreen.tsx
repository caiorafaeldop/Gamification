import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Rocket, Users, Target, ArrowLeft, Heart, CheckCircle, Calendar, ListTodo,
    CheckSquare, Zap, ChevronLeft, ChevronRight, Crown, Trophy, Medal, LayoutGrid,
} from 'lucide-react';
import { getProjectDetails } from '../services/project.service';
import { registerProjectInterest } from '../services/explore.service';
import { PageHero, EmptyState, SectionHeader, SurfaceCard } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { LikeButton } from '../components/LikeButton';
import { useProfile } from '../hooks/useProfile';
import toast from 'react-hot-toast';

const MEMBERS_PER_PAGE = 4;
const AUTOPLAY_MS = 6000;

const ProjectLandingScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [interestExpressed, setInterestExpressed] = useState(false);
    const { data: currentUser } = useProfile();

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
        },
    });

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">
                <Skeleton height={240} className="rounded-3xl" />
                <Skeleton height={120} className="rounded-2xl" />
                <Skeleton height={320} className="rounded-2xl" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
                <EmptyState
                    icon={Target}
                    title="Projeto não encontrado"
                    description="O projeto pode ter sido removido ou tornado privado."
                    action={
                        <button
                            onClick={() => navigate('/projects')}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
                        >
                            <ArrowLeft size={14} /> Voltar para Projetos
                        </button>
                    }
                />
            </div>
        );
    }

    const color = project.Group?.color || project.color || '#29B6F6';
    const memberCount = project._count?.members || project.members?.length || 0;
    const isMember =
        !!currentUser &&
        (currentUser.id === project.leaderId ||
            project.members?.some((m: any) => m.user?.id === currentUser.id));

    return (
        <div className="min-h-full bg-background-light pb-20 dark:bg-background-dark">
            <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">

                <PageHero
                    icon={Target}
                    tagLabel={
                        <button
                            onClick={() => navigate('/projects')}
                            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
                            style={{ borderColor: `${color}33`, backgroundColor: `${color}1A`, color }}
                        >
                            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                            Voltar para Projetos
                        </button>
                    }
                    title={project.title}
                    description={project.description || 'Nenhuma descrição fornecida.'}
                    highlight={
                        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/40 bg-white/70 p-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/20">
                            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800"
                                    style={{ backgroundColor: project.leader?.avatarColor || color }}
                                >
                                    {project.leader?.avatarUrl ? (
                                        <img src={project.leader.avatarUrl} alt={project.leader.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-white">
                                            {project.leader?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        Líder
                                    </p>
                                    <p className="truncate text-xs font-bold text-secondary dark:text-white">
                                        {project.leader?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                    style={{ backgroundColor: `${color}20`, color }}
                                >
                                    <Users size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        Equipe
                                    </p>
                                    <p className="truncate text-xs font-bold text-secondary dark:text-white">
                                        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                    actionButtons={
                        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                            {/* Secondary cluster: like + group chip */}
                            <div className="flex items-center gap-2">
                                <LikeButton
                                    projectId={id!}
                                    initialLiked={project.liked ?? false}
                                    initialCount={project.likeCount ?? 0}
                                    visibility={project.visibility}
                                    variant="inline"
                                />

                                {project.Group && (
                                    <button
                                        onClick={() => navigate(`/groups/${project.Group.id}`)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-secondary shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-surface-dark dark:text-white dark:hover:bg-white/5"
                                        title={`Ver grupo ${project.Group.name}`}
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded">
                                            {project.Group.logoUrl ? (
                                                <img src={project.Group.logoUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Rocket size={12} className="text-gray-400" />
                                            )}
                                        </span>
                                        <span className="max-w-[120px] truncate">{project.Group.name}</span>
                                    </button>
                                )}
                            </div>

                            {/* Primary CTA — context-aware */}
                            {isMember ? (
                                <button
                                    onClick={() => navigate(`/kanban/${id}`)}
                                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                                    style={{
                                        backgroundColor: color,
                                        boxShadow: `0 10px 24px -10px ${color}`,
                                    }}
                                >
                                    <LayoutGrid size={18} /> Abrir Board
                                </button>
                            ) : project.isJoiningOpen ? (
                                <button
                                    onClick={() => interestMutation.mutate()}
                                    disabled={interestExpressed || interestMutation.isPending}
                                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
                                    style={{
                                        backgroundColor: interestExpressed ? '#10B981' : color,
                                        boxShadow: `0 10px 24px -10px ${interestExpressed ? '#10B981' : color}`,
                                    }}
                                >
                                    {interestMutation.isPending ? (
                                        'Enviando...'
                                    ) : interestExpressed ? (
                                        <>
                                            <CheckCircle size={18} /> Interesse Enviado
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={18} /> Tenho Interesse
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-6 py-3 text-sm font-bold text-gray-500 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400">
                                    Vagas Fechadas
                                </div>
                            )}
                        </div>
                    }
                />

                {/* KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-surface-dark">
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: '#8B5CF6' }} />
                        <div className="relative z-10">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: '#8B5CF615', border: '1px solid #8B5CF625' }}>
                                <Calendar size={20} style={{ color: '#8B5CF6' }} />
                            </div>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Início</p>
                            <p className="font-display text-2xl font-black leading-none text-secondary dark:text-white">
                                {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                            <p className="mt-1.5 text-xs font-medium text-gray-500">Data de criação</p>
                        </div>
                    </div>

                    <div className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-surface-dark">
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: '#3B82F6' }} />
                        <div className="relative z-10">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: '#3B82F615', border: '1px solid #3B82F625' }}>
                                <ListTodo size={20} style={{ color: '#3B82F6' }} />
                            </div>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Missões (Total)</p>
                            <p className="font-display text-2xl font-black leading-none text-secondary dark:text-white">
                                {project.stats?.tasksCount ?? project.tasks?.length ?? 0}
                            </p>
                            <p className="mt-1.5 text-xs font-medium text-gray-500">Tarefas atribuídas</p>
                        </div>
                    </div>

                    <div className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-surface-dark">
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: '#10B981' }} />
                        <div className="relative z-10">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: '#10B98115', border: '1px solid #10B98125' }}>
                                <CheckSquare size={20} style={{ color: '#10B981' }} />
                            </div>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Concluídas</p>
                            <p className="font-display text-2xl font-black leading-none text-secondary dark:text-white">
                                {project.stats?.tasksCompleted ?? 0}
                            </p>
                            <p className="mt-1.5 text-xs font-medium text-gray-500">Tarefas finalizadas</p>
                        </div>
                    </div>

                    <div className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-surface-dark">
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] opacity-10 transition-opacity group-hover:opacity-30" style={{ backgroundColor: '#F59E0B' }} />
                        <div className="relative z-10">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: '#F59E0B15', border: '1px solid #F59E0B25' }}>
                                <Zap size={20} style={{ color: '#F59E0B' }} />
                            </div>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Points</p>
                            <p className="font-display text-2xl font-black leading-none text-secondary dark:text-white">
                                {project.stats?.totalPoints ?? 0}
                            </p>
                            <p className="mt-1.5 text-xs font-bold text-amber-500">XP Gerado</p>
                        </div>
                    </div>
                </div>

                {project.members && project.members.length > 0 && (
                    <MembersCarousel members={project.members} color={color} />
                )}
            </div>
        </div>
    );
};

interface Member {
    user: { id: string; name: string; avatarUrl?: string | null; avatarColor?: string | null };
    projectScore?: number;
}

const MembersCarousel: React.FC<{ members: Member[]; color: string }> = ({ members, color }) => {
    const total = members.length;
    const totalPages = Math.max(1, Math.ceil(total / MEMBERS_PER_PAGE));
    const hasPagination = totalPages > 1;

    const [page, setPage] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!hasPagination || paused) return;
        intervalRef.current = setInterval(() => {
            setPage((p) => (p + 1) % totalPages);
        }, AUTOPLAY_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [hasPagination, paused, totalPages]);

    // Sort by projectScore so podium accents land on the right people
    const sorted = [...members].sort((a, b) => (b.projectScore ?? 0) - (a.projectScore ?? 0));
    const top3Ids = new Set(sorted.slice(0, 3).map((m) => m.user.id));
    const rankById = new Map(sorted.map((m, i) => [m.user.id, i]));

    const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
    const goNext = () => setPage((p) => (p + 1) % totalPages);

    return (
        <section className="mt-10">
            <SectionHeader
                icon={<Trophy size={20} style={{ color }} />}
                title="Membros (Top XP)"
                description="Quem está construindo este projeto."
                action={
                    hasPagination && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goPrev}
                                aria-label="Membros anteriores"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:text-secondary dark:border-white/10 dark:bg-surface-dark dark:hover:text-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={goNext}
                                aria-label="Próximos membros"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:text-secondary dark:border-white/10 dark:bg-surface-dark dark:hover:text-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )
                }
            />

            <div
                className="mt-5 overflow-hidden"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${page * 100}%)` }}
                >
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const slice = members.slice(
                            pageIdx * MEMBERS_PER_PAGE,
                            pageIdx * MEMBERS_PER_PAGE + MEMBERS_PER_PAGE
                        );
                        return (
                            <div
                                key={pageIdx}
                                className="grid w-full shrink-0 grid-cols-2 gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4"
                            >
                                {slice.map((m) => (
                                    <MemberCard
                                        key={m.user.id}
                                        member={m}
                                        color={color}
                                        rank={rankById.get(m.user.id)}
                                        isTop3={top3Ids.has(m.user.id)}
                                    />
                                ))}
                                {/* Pad incomplete pages so layout stays 4-up on desktop */}
                                {slice.length < MEMBERS_PER_PAGE &&
                                    Array.from({ length: MEMBERS_PER_PAGE - slice.length }).map((_, i) => (
                                        <div key={`pad-${i}`} className="hidden lg:block" />
                                    ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {hasPagination && (
                <div className="mt-5 flex justify-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            aria-label={`Ir para página ${i + 1}`}
                            className="h-1.5 rounded-full transition-all"
                            style={{
                                width: i === page ? 24 : 8,
                                backgroundColor: i === page ? color : '#CBD5E1',
                                opacity: i === page ? 1 : 0.6,
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

const PODIUM = [
    { color: '#F59E0B', icon: Crown, label: '1º' },   // gold
    { color: '#94A3B8', icon: Medal, label: '2º' },   // silver
    { color: '#B45309', icon: Medal, label: '3º' },   // bronze
];

const MemberCard: React.FC<{
    member: Member;
    color: string;
    rank: number | undefined;
    isTop3: boolean;
}> = ({ member, color, rank, isTop3 }) => {
    const podium = isTop3 && rank !== undefined ? PODIUM[rank] : null;
    const Icon = podium?.icon;

    return (
        <SurfaceCard
            padding="lg"
            className="group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={
                podium
                    ? { borderColor: `${podium.color}55` }
                    : undefined
            }
        >
            {podium && Icon && (
                <div
                    className="absolute right-3 top-3 flex h-7 items-center gap-1 rounded-full px-2 text-[10px] font-black text-white shadow-sm"
                    style={{ backgroundColor: podium.color }}
                >
                    <Icon size={12} />
                    {podium.label}
                </div>
            )}

            <div
                className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow-sm dark:ring-gray-800"
                style={{ backgroundColor: member.user.avatarColor || color }}
            >
                {member.user.avatarUrl ? (
                    <img
                        src={member.user.avatarUrl}
                        alt={member.user.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-xl font-black text-white">
                        {member.user.name?.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            <p className="line-clamp-1 text-sm font-bold text-secondary dark:text-white">
                {member.user.name}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Colaborador
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 dark:border-white/5 dark:bg-white/5">
                <Zap size={12} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-black text-secondary dark:text-white">
                    {member.projectScore ?? 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-gray-400">pts</span>
            </div>
        </SurfaceCard>
    );
};

export default ProjectLandingScreen;
