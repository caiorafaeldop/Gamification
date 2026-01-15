import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    BookOpen,
    Save,
    ArrowLeft,
    Loader,
    Shield,
    Trophy,
    Edit3,
    Zap,
    BarChart3,
    Star,
    Code,
    Camera,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateUser, uploadAvatar } from '../services/user.service';
import toast from 'react-hot-toast';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        course: '',
        bio: '',
        skills: '', // Comma separated for editing
        avatarColor: '',
        avatarUrl: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setUser(data);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                course: data.course || '',
                bio: data.bio || '',
                skills: (data.skills || []).join(', '),
                avatarColor: data.avatarColor || '#3B82F6',
                avatarUrl: data.avatarUrl || ''
            });
        } catch (error) {
            toast.error('Erro ao carregar perfil');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB');
                return;
            }

            setUploading(true);
            try {
                const response = await uploadAvatar(file);
                // After upload, update the user profile with the new avatarUrl
                await updateUser(user.id, { avatarUrl: response.url });
                setFormData({ ...formData, avatarUrl: response.url });
                setUser({ ...user, avatarUrl: response.url });
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
            const skillsArray = formData.skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '');

            await updateUser(user.id, {
                name: formData.name,
                course: formData.course,
                bio: formData.bio,
                skills: skillsArray,
                avatarColor: formData.avatarColor,
                avatarUrl: formData.avatarUrl
            });

            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (error: any) {
            toast.error('Erro ao atualizar perfil: ' + (error.response?.data?.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

            {/* Header Background Decoration (from template) */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    {/* Avatar with Upload */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary border-4 border-white dark:border-slate-600 shadow-lg overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} className="text-gray-300 dark:text-gray-500" />
                            )}

                            {/* Hover Overlay */}
                            <label className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full ${uploading ? 'opacity-100 !cursor-wait' : ''}`}>
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                {uploading ? (
                                    <Loader className="text-white animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Camera className="text-white mb-1.5" size={26} />
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Alterar Foto</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-surface-dark rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide w-max mx-auto md:mx-0">
                                {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'LEADER' ? 'Líder' : 'Estudante'}
                            </span>
                        </div>

                        {/* Level Progress Bar (Gamification) */}
                        <div className="mt-1 mb-4 max-w-sm mx-auto md:mx-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1 gap-1 sm:gap-0">
                                <span>Progresso para Nível{' '}{(user?.level || 1) + 1}:</span>
                                <span className="text-primary text-xs">{user?.connectaPoints || 0} / {((user?.level || 1) * 1000)} XP</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-primary to-sky-400 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    style={{ width: `${Math.min(((user?.connectaPoints || 0) / ((user?.level || 1) * 1000)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mb-4 font-medium italic">
                            {user?.bio || 'Nenhuma biografia definida. Clique em editar para adicionar uma!'}
                        </p>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {user?.skills && user.skills.length > 0 ? (
                                user.skills.map((skill: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-semibold">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">Sem habilidades listadas</span>
                            )}
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-primary hover:bg-sky-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 flex items-center gap-2 font-bold transition-all transform hover:-translate-y-0.5"
                        >
                            {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                            {isEditing ? 'Cancelar' : 'Editar Perfil'}
                        </button>
                    </div>
                </div>
            </div>

            {isEditing ? (
                /* Edit Mode Form */
                <div className="animate-in zoom-in-95 duration-200">
                    <form className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6" onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-primary" size={24} />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Configurações da Conta</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Course */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Curso / Área</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-inner"
                                        placeholder="Ex: Engenharia de Computação"
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Habilidades (separadas por vírgula)</label>
                                <div className="relative">
                                    <Code className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-inner"
                                        placeholder="Ex: React, Typescript, UI Design"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Biografia</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-inner resize-none"
                                    placeholder="Conte um pouco sobre você e seus interesses..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                disabled={saving}
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin" size={28} /> : <Save size={28} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* View Mode (Design Stats and Projects) */
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    {/* Stats Row - Horizontal Scroll on Mobile */}
                    <div className="flex overflow-x-auto gap-4 pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 scrollbar-hide snap-x">
                        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[280px] md:min-w-0 snap-center">
                            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nível Atual</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {typeof user?.tier === 'object' ? user.tier.name : (user?.tier || 'Iniciante')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[280px] md:min-w-0 snap-center">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">XP Atual</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{user?.connectaPoints || 0} XP</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[280px] md:min-w-0 snap-center">
                            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Ranking Global</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white"># --</p>
                            </div>
                        </div>
                    </div>

                    {/* Projects Participating */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Projetos atuais: </h3>
                            <button onClick={() => navigate('/projects')} className="text-sm text-primary hover:text-sky-400 font-bold">Ver todos</button>
                        </div>

                        {user?.memberOfProjects && user.memberOfProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.memberOfProjects.map((membership: any) => (
                                    <div key={membership.project.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group cursor-pointer" onClick={() => navigate(`/project-details/${membership.project.id}`)}>
                                        <div className="h-32 md:h-40 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                                            {membership.project.coverUrl ? (
                                                <img src={membership.project.coverUrl} alt={membership.project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <Star className="text-slate-300 dark:text-slate-600 transition-transform group-hover:scale-110" size={48} />
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                            <span className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                {membership.project.category || 'Atividade'}
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{membership.project.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                                {membership.project.description || 'Nenhuma descrição fornecida.'}
                                            </p>
                                            <div className="mt-auto">
                                                <button className="w-full py-2.5 px-4 rounded-lg bg-sky-50 dark:bg-slate-900 text-primary dark:text-primary font-bold text-sm hover:bg-sky-100 dark:hover:bg-slate-950 transition-colors border border-transparent dark:border-slate-800">
                                                    Continuar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                                <User size={48} className="text-slate-400 mx-auto mb-4 opacity-50" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Você ainda não entrou em nenhum projeto.</p>
                                <button
                                    onClick={() => navigate('/projects')}
                                    className="mt-4 text-primary font-bold hover:underline"
                                >
                                    Buscar projetos disponíveis
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
