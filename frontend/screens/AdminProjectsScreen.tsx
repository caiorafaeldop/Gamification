import React, { useState, useEffect } from 'react';
import { getAdminProjects, updateProject } from '../services/admin.service';
import { FolderOpen, Edit, Save, X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Project, ProjectStatus, statusLabels, statusStyles } from '../types';

const AdminProjectsScreen = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');


    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAdminProjects();
            console.log(data);
            // Backend returns { projects: [], total }
            setProjects(Array.isArray(data) ? data : data.projects || []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar projetos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleSave = async () => {
        if (!editingProject) return;
        try {
            await updateProject(editingProject.id, formData);
            toast.success('Projeto atualizado!');
            setEditingProject(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar projeto.');
        }
    };

    const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });


    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FolderOpen className="text-primary" /> Projetos Admin
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Edite configurações, status e recompensas dos projetos.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar projeto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white w-full md:w-64"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                    <option value="archived">Arquivados</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-500 col-span-full text-center">Carregando...</p>
                ) : filteredProjects.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center">Nenhum projeto encontrado.</p>
                ) : (
                    filteredProjects.map((project: any) => (
                        <div key={project.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow relative group">
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
                                className="w-full py-2 flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors rounded-xl font-semibold text-sm"
                            >
                                <Edit size={16} /> Editar
                            </button>
                        </div>
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
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none text-center [text-align-last:center]"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="archived">Arquivado</option>
                                </select>
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
