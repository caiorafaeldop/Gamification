import React, { useState } from 'react';
import { FolderOpen, Edit, Save, X, Search, ShieldCheck } from 'lucide-react';
import { Project, ProjectStatus, statusLabels, statusStyles } from '../types';
import { useAdminProjects } from '../hooks/useAdmin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { PageHero, SurfaceCard } from '../components/ui';

const AdminProjectsScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

    const query = useAdminProjects();
    const rawData = query.data;
    const projects: Project[] = Array.isArray(rawData) ? rawData : rawData?.projects ?? [];
    const loading = query.isLoading;

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description || '',
            status: project.status || 'active',
            pointsPerOpenTask: project.pointsPerOpenTask,
            pointsPerCompletedTask: project.pointsPerCompletedTask
        });
    };

    const handleSave = () => {
        if (!editingProject) return;
        query.updateMutation.mutate(
            { projectId: editingProject.id, data: formData },
            { onSuccess: () => setEditingProject(null) }
        );
    };

    const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });


    return (
        <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
            <PageHero
                icon={ShieldCheck}
                tagLabel="Painel Admin"
                title="Projetos Admin"
                description="Edite configurações, status e recompensas dos projetos da plataforma."
                actionButtons={
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar projeto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-surface-dark dark:text-white md:w-64"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => setStatusFilter(val as any)}
                            >
                                <SelectTrigger className="h-[42px] w-full border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-dark">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="active">Ativos</SelectItem>
                                    <SelectItem value="inactive">Inativos</SelectItem>
                                    <SelectItem value="archived">Arquivados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <SurfaceCard padding="lg" className="col-span-full text-center text-gray-500">Carregando...</SurfaceCard>
                ) : filteredProjects.length === 0 ? (
                    <SurfaceCard padding="lg" className="col-span-full text-center text-gray-500">Nenhum projeto encontrado.</SurfaceCard>
                ) : (
                    filteredProjects.map((project: any) => (
                        <SurfaceCard key={project.id} padding="md" className="group relative transition-shadow hover:shadow-md">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/20 flex items-center justify-center">
                                        {project.coverUrl ? (
                                            <img
                                                src={project.coverUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <FolderOpen className="text-primary" size={20} />
                                        )}
                                    </div>

                                    <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{project.title}</h3>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold inline-flex items-center justify-center min-w-[75px] ${statusStyles[project.status] || 'bg-gray-100 text-gray-500'}`}>
                                    {statusLabels[project.status] || 'Indefinido'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px] mb-4">
                                {project.description || 'Sem descrição.'}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-black/20 p-2 rounded-lg">

                                <div>Pts Criar: <span className="font-bold text-gray-900 dark:text-white">{project.pointsPerOpenTask}</span></div>
                                <div>Pts Concluir: <span className="font-bold text-gray-900 dark:text-white">{project.pointsPerCompletedTask}</span></div>
                                <div>Membros: <span className="font-bold text-gray-900 dark:text-white">{project._count?.members || 0}</span></div>
                                <div>Tarefas: <span className="font-bold text-gray-900 dark:text-white">{project._count?.tasks || 0}</span></div>
                            </div>

                            <button
                                onClick={() => handleEdit(project)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-2 text-sm font-semibold transition-colors hover:bg-primary hover:text-white dark:bg-white/5 dark:hover:bg-primary"
                            >
                                <Edit size={16} /> Editar
                            </button>
                        </SurfaceCard>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">Editar Projeto</h3>
                            <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="w-full bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Ativo</SelectItem>
                                        <SelectItem value="inactive">Inativo</SelectItem>
                                        <SelectItem value="archived">Arquivado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pts Criar Tarefa</label>
                                    <input
                                        type="number"
                                        value={formData.pointsPerOpenTask}
                                        onChange={(e) => setFormData({ ...formData, pointsPerOpenTask: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pts Concluir Tarefa</label>
                                    <input
                                        type="number"
                                        value={formData.pointsPerCompletedTask}
                                        onChange={(e) => setFormData({ ...formData, pointsPerCompletedTask: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditingProject(null)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjectsScreen;
