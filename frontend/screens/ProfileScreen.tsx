import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    User,
    Mail,
    BookOpen,
    Save,
    Loader,
    Shield,
    Trophy,
    Edit3,
    Zap,
    BarChart3,
    Star,
    Code,
    Camera,
    X,
    ArrowRight,
    LogOut,
    Linkedin,
    Github,
    Link as LinkIcon,
    ExternalLink,
    UserCircle,
    FolderOpen,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateUser, uploadAvatar } from '../services/user.service';
import toast from 'react-hot-toast';
import { useProfile, useUserProfile } from '../hooks/useProfile';
import { Skeleton } from '../components/Skeleton';
import { PageHero, SectionHeader, SurfaceCard, EmptyState, StatCard } from '../components/ui';

const ProfileScreen = () => {
    const { id } = useParams<{ id: string }>();
    const isMyProfile = !id;
    const navigate = useNavigate();
    const { logout } = useAuth();
    const queryClient = useQueryClient();

    const myProfileQuery = useProfile();
    const otherUserQuery = useUserProfile(id);
    const activeQuery = id ? otherUserQuery : myProfileQuery;
    const loading = activeQuery.isLoading;
    const user = activeQuery.data;

    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        course: '',
        bio: '',
        skills: '',
        avatarColor: '',
        avatarUrl: '',
        contactEmail: '',
        linkedinUrl: '',
        githubUrl: '',
    });

    useEffect(() => {
        if (user && isMyProfile) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                course: user.course || '',
                bio: user.bio || '',
                skills: (user.skills || []).join(', '),
                avatarColor: user.avatarColor || '#3B82F6',
                avatarUrl: user.avatarUrl || '',
                contactEmail: user.contactEmail || '',
                linkedinUrl: user.linkedinUrl || '',
                githubUrl: user.githubUrl || '',
            });
        }
    }, [user, isMyProfile]);

    const refreshProfile = () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        if (id) queryClient.invalidateQueries({ queryKey: ['user', id] });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB');
                return;
            }
            setUploading(true);
            try {
                const response = await uploadAvatar(file);
                await updateUser(user.id, { avatarUrl: response.url });
                setFormData({ ...formData, avatarUrl: response.url });
                refreshProfile();
                toast.success('Foto de perfil atualizada!');
            } catch (error) {
                console.error('Error upload:', error);
                toast.error('Erro ao fazer upload da imagem.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter((s) => s !== '');
            await updateUser(user.id, {
                name: formData.name,
                course: formData.course,
                bio: formData.bio,
                skills: skillsArray,
                avatarColor: formData.avatarColor,
                avatarUrl: formData.avatarUrl,
                contactEmail: formData.contactEmail || null,
                linkedinUrl: formData.linkedinUrl || null,
                githubUrl: formData.githubUrl || null,
            });
            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false);
            refreshProfile();
        } catch (error: any) {
            toast.error('Erro ao atualizar perfil: ' + (error.response?.data?.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
                <Skeleton height="260px" className="w-full rounded-3xl" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={100} className="rounded-2xl" />
                    ))}
                </div>
                <Skeleton height="220px" className="rounded-2xl" />
            </div>
        );
    }

    const heroHighlight = (
        <div className="relative flex flex-col items-center gap-4 md:flex-row">
            <div className="group relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-primary shadow-lg dark:border-slate-600 dark:bg-slate-700 md:h-28 md:w-28">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <User size={56} className="text-gray-300 dark:text-gray-500" />
                    )}
                    {isMyProfile && (
                        <label className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:opacity-100 ${uploading ? '!cursor-wait opacity-100' : ''}`}>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            {uploading ? (
                                <Loader className="animate-spin text-white" size={24} />
                            ) : (
                                <>
                                    <Camera className="mb-1.5 text-white" size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Alterar</span>
                                </>
                            )}
                        </label>
                    )}
                </div>
                <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500 dark:border-surface-dark" />
            </div>

            <div className="max-w-sm rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/20">
                <div className="mb-2 flex flex-col gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>Progresso p/ nível {(user?.level || 1) + 1}</span>
                    <span className="text-primary">
                        {user?.connectaPoints || 0} / {((user?.level || 1) * 1000)} 🪙
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200/50 bg-slate-100 shadow-inner dark:border-slate-700/50 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-sky-400 shadow-[0_0_10px_rgba(41,182,246,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(((user?.connectaPoints || 0) / ((user?.level || 1) * 1000)) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div
            className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 40px)' }}
        >
            <PageHero
                icon={UserCircle}
                tagLabel={user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'LEADER' ? 'Líder de Projeto' : 'Estudante Connecta'}
                title={user?.name || 'Perfil'}
                description={user?.bio || 'Nenhuma biografia definida. Clique em editar para adicionar uma!'}
                highlight={heroHighlight}
                actionButtons={
                    isMyProfile ? (
                        <>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-sky-600"
                            >
                                {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                                {isEditing ? 'Cancelar' : 'Editar Perfil'}
                            </button>
                            {!isEditing && (
                                <button
                                    onClick={logout}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 font-bold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white"
                                >
                                    <LogOut size={18} />
                                    Sair
                                </button>
                            )}
                        </>
                    ) : undefined
                }
            />

            {!isEditing && (
                <div className="flex flex-wrap items-center gap-2">
                    {user?.skills && user.skills.length > 0 ? (
                        user.skills.map((skill: string, index: number) => (
                            <span
                                key={index}
                                className="rounded-full border border-gray-200 bg-surface-light px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-700 dark:bg-surface-dark dark:text-gray-300"
                            >
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs italic text-gray-400">Sem habilidades listadas</span>
                    )}
                </div>
            )}

            {!isEditing && (user?.contactEmail || user?.linkedinUrl || user?.githubUrl) && (
                <div className="flex flex-wrap gap-3">
                    {user?.contactEmail && (
                        <a href={`mailto:${user.contactEmail}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                            <Mail size={14} />
                            {user.contactEmail}
                        </a>
                    )}
                    {user?.linkedinUrl && (
                        <a href={user.linkedinUrl.startsWith('http') ? user.linkedinUrl : `https://${user.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40">
                            <Linkedin size={14} />
                            LinkedIn
                        </a>
                    )}
                    {user?.githubUrl && (
                        <a href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://${user.githubUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                            <Github size={14} />
                            GitHub
                        </a>
                    )}
                </div>
            )}

            {isEditing ? (
                <SurfaceCard padding="lg" className="animate-in zoom-in-95 duration-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <SectionHeader
                            icon={<Shield size={22} />}
                            title="Configurações da Conta"
                            description="Atualize suas informações públicas e links de contato."
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Curso / Área</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                        placeholder="Ex: Engenharia de Computação"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Habilidades</label>
                                <div className="relative">
                                    <Code className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                        placeholder="Ex: React, Typescript, UI Design"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Biografia</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    placeholder="Conte um pouco sobre você e seus interesses..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">Links de Contato</label>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                            type="email"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                            placeholder="Email de contato"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                            placeholder="linkedin.com/in/seu-perfil"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                            placeholder="github.com/seu-usuario"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg border border-slate-200 px-6 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-white/5"
                                disabled={saving}
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-blue-600 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                Salvar
                            </button>
                        </div>
                    </form>
                </SurfaceCard>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <StatCard
                            icon={Trophy}
                            label="Nível Atual"
                            value={typeof user?.tier === 'object' ? user.tier.name : user?.tier || 'Iniciante'}
                            accent="gold"
                        />
                        <StatCard
                            icon={Zap}
                            label="🪙 Atual"
                            value={`${user?.connectaPoints || 0} 🪙`}
                            accent="primary"
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Ranking"
                            value="# --"
                            hint="Calculado globalmente"
                            accent="green"
                        />
                    </div>

                    {user?.id && (
                        <SurfaceCard padding="lg" className="border-primary/20 bg-gradient-to-r from-primary/5 to-sky-400/5 dark:border-primary/30">
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ExternalLink size={26} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {isMyProfile ? 'Meu Currículo Público' : 'Currículo Público'}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {isMyProfile
                                                ? 'Compartilhe suas conquistas, projetos e nível Connecta com recrutadores.'
                                                : 'Veja a visão detalhada deste currículo.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center gap-3 sm:w-auto">
                                    <button
                                        onClick={() => {
                                            const landingBase = import.meta.env.VITE_LANDING_PAGE_URL || 'https://connecta-landing-page.onrender.com';
                                            const url = `${landingBase}/#/cv/${user.id}`;
                                            navigator.clipboard.writeText(url);
                                            toast.success('Link do currículo copiado!');
                                        }}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-surface-light px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
                                    >
                                        <LinkIcon size={18} />
                                        Copiar Link
                                    </button>
                                    <button
                                        onClick={() => {
                                            const landingBase = import.meta.env.VITE_LANDING_PAGE_URL || 'https://connecta-landing-page.onrender.com';
                                            const url = `${landingBase}/#/cv/${user.id}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-white shadow-md shadow-primary/20 transition-colors hover:bg-blue-600 sm:flex-none"
                                    >
                                        Ver Currículo
                                    </button>
                                </div>
                            </div>
                        </SurfaceCard>
                    )}

                    <div className="space-y-6">
                        <SectionHeader
                            icon={<FolderOpen size={22} />}
                            title={`Projetos ${isMyProfile ? 'atuais' : `de ${user?.name}`}`}
                            description="Os projetos ativos que compõem essa trajetória."
                            action={
                                <button
                                    onClick={() => navigate('/projects')}
                                    className="group hidden items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white active:scale-95 sm:inline-flex"
                                >
                                    Ver todos
                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            }
                        />

                        {user?.memberOfProjects && user.memberOfProjects.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {user.memberOfProjects.map((membership: any) => (
                                        <div
                                            key={membership.project.id}
                                            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface-light shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-surface-dark"
                                            onClick={() => navigate(`/project-details/${membership.project.id}`)}
                                        >
                                            <div className="relative flex h-32 items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 md:h-40">
                                                {membership.project.coverUrl ? (
                                                    <img
                                                        src={membership.project.coverUrl}
                                                        alt={membership.project.title}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <Star className="text-slate-300 transition-transform group-hover:scale-110 dark:text-slate-600" size={48} />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
                                                <span className="absolute bottom-3 left-3 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                                    {membership.project.category || 'Atividade'}
                                                </span>
                                            </div>
                                            <div className="flex flex-1 flex-col p-5">
                                                <h4 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                                                    {membership.project.title}
                                                </h4>
                                                <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                                    {membership.project.description || 'Nenhuma descrição fornecida.'}
                                                </p>
                                                <div className="mt-auto">
                                                    <button className="w-full rounded-lg border border-transparent bg-sky-50 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950">
                                                        Continuar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="sm:hidden">
                                    <button
                                        onClick={() => navigate('/projects')}
                                        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white active:scale-95"
                                    >
                                        Ver todos
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={FolderOpen}
                                title={isMyProfile ? 'Você ainda não entrou em nenhum projeto' : 'Sem projetos ativos'}
                                description={isMyProfile ? 'Explore a lista de projetos disponíveis e comece a colaborar!' : 'Este usuário ainda não participa de projetos.'}
                                action={
                                    isMyProfile ? (
                                        <button
                                            onClick={() => navigate('/projects')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
                                        >
                                            Buscar projetos
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : undefined
                                }
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
