import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Rocket, Users, ArrowLeft, Heart, CheckCircle, Calendar, ListTodo,
    CheckSquare, Zap, ChevronLeft, ChevronRight, Crown, Trophy, Medal, LayoutGrid,
    Target,
} from 'lucide-react';
import { getProjectDetails } from '../services/project.service';
import { requestJoinProject } from '../services/explore.service';
import { EmptyState, SectionHeader, SurfaceCard } from '../components/ui';
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
        mutationFn: () => requestJoinProject(id!),
        onSuccess: (result) => {
            setInterestExpressed(true);
            const icon = result.status === 'joined' ? '🚀' : result.status === 'group-request-sent' ? '🔒' : '🙌';
            toast.success(result.message, { icon });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro ao solicitar entrada');
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
    const isAdmin = currentUser?.role === 'ADMIN';
    const isLeader = currentUser?.id === project.leaderId;
    const isExplicitMember = project.members?.some((m: any) => 
        (m.userId === currentUser?.id) || (m.user?.id === currentUser?.id)
    );
    
    const isMember = isLeader || isExplicitMember;
    const canAccessBoard = isMember || isAdmin;

    return (
        <div className="min-h-full bg-background-light pb-20 dark:bg-background-dark">
            <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">

                {/* ── HERO ── */}
                <header
                    className="relative overflow-hidden rounded-2xl border border-gray-100 bg-surface-light/90 p-5 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-surface-dark/80"
                    style={{ borderTopColor: `${color}44` }}
                >
                    {/* decorative blur */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: `${color}18` }} />
                    <div className="pointer-events-none absolute inset-0 bg-network-pattern opacity-30 dark:opacity-10" />

                    <div className="relative z-10 flex flex-col gap-4">

                        {/* Row 1 — back + like */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate('/projects')}
                                className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
                            >
                                <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                                Voltar
                            </button>

                            <LikeButton
                                projectId={id!}
                                initialLiked={project.liked ?? false}
                                initialCount={project.likeCount ?? 0}
                                visibility={project.visibility}
                                variant="inline"
                            />
                        </div>

                        {/* Row 2 — title + CTA */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                {/* group chip */}
                                {project.Group && (
                                    <button
                                        onClick={() => navigate(`/groups/${project.Group.id}`)}
                                        className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
                                        style={{ borderColor: `${color}44`, backgroundColor: `${color}15`, color }}
                                    >
                                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                                            {project.Group.logoUrl
                                                ? <img src={project.Group.logoUrl} alt="" className="h-full w-full object-cover" />
                                                : <Rocket size={9} />}
                                        </span>
                                        {project.Group.name}
                                    </button>
                                )}

                                <h1 className="font-display text-xl font-extrabold tracking-tight text-secondary dark:text-white sm:text-2xl">
                                    {project.title}
                                </h1>
                            </div>

                            {/* Primary CTA */}
                            <div className="flex shrink-0 items-center gap-3">
                                {isAdmin && !isMember && (
                                    <button
                                        onClick={() => navigate(`/kanban/${id}`)}
                                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400"
                                    >
                                        <LayoutGrid size={14} /> Board (Admin)
                                    </button>
                                )}

                                {isMember ? (
                                    <button
                                        onClick={() => navigate(`/kanban/${id}`)}
                                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                                        style={{ backgroundColor: color, boxShadow: `0 8px 20px -8px ${color}` }}
                                    >
                                        <LayoutGrid size={15} /> Abrir Board
                                    </button>
                                ) : project.visibility === 'PRIVATE' && !isAdmin ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-400 dark:border-gray-700 dark:bg-white/5">
                                        Projeto Privado
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => interestMutation.mutate()}
                                        disabled={interestExpressed || interestMutation.isPending}
                                        className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
                                        style={{
                                            backgroundColor: interestExpressed ? '#10B981' : color,
                                            boxShadow: `0 8px 20px -8px ${interestExpressed ? '#10B981' : color}`,
                                        }}
                                    >
                                        {interestMutation.isPending ? 'Enviando...'
                                            : interestExpressed ? <><CheckCircle size={15} /> Solicitado</>
                                            : project.visibility === 'PUBLIC_OPEN' ? <><Rocket size={15} /> Entrar Agora</>
                                            : <><Heart size={15} /> Solicitar Entrada</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Row 3 — leader + members */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Leader */}
                            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                                <div
                                    className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white dark:ring-gray-800"
                                    style={{ backgroundColor: project.leader?.avatarColor || color }}
                                >
                                    {project.leader?.avatarUrl
                                        ? <img src={project.leader.avatarUrl} alt={project.leader.name} className="h-full w-full object-cover" />
                                        : <span className="text-[10px] font-bold text-white">{project.leader?.name?.charAt(0).toUpperCase()}</span>}
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Líder</p>
                                    <p className="text-xs font-bold text-secondary dark:text-white">{project.leader?.name}</p>
                                </div>
                            </div>

                            {/* Members count */}
                            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                                    <Users size={12} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Equipe</p>
                                    <p className="text-xs font-bold text-secondary dark:text-white">
                                        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Row 4 — description full width */}
                        {project.description && (
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                {project.description}
                            </p>
                        )}
                    </div>
                </header>

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
