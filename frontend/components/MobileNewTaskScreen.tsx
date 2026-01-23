import React from 'react';
import { X, MoreVertical, Image, Folder, ChevronUp, ChevronDown, CheckSquare, Paperclip, Users, AlignLeft, Tag, User, Clock, Calendar, BarChart3, Check } from 'lucide-react';
import MemberSelect from './MemberSelect';

interface MobileNewTaskScreenProps {
    navigate: any;
    location: any;
    // Removed isEditing
    user: any;
    projects: any[];
    loadingProjects: boolean;
    users: any[];
    loadingUsers: boolean;
    taskLevel: 'basic' | 'medium' | 'large';
    points: number;
    title: string;
    description: string;
    projectId: string;
    assignedToId: string;
    estimatedTime: string;
    deadline: string;
    startDate: string;
    submitting: boolean;
    error: string | null;
    showQuickActions: boolean;
    showDescription: boolean;
    selectedProject: any;
    setTaskLevel: (level: 'basic' | 'medium' | 'large') => void;
    setPoints: (points: number) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setProjectId: (id: string) => void;
    setAssignedToId: (id: string) => void;
    setEstimatedTime: (time: string) => void;
    setDeadline: (date: string) => void;
    setStartDate: (date: string) => void;
    setShowQuickActions: (show: boolean) => void;
    setShowDescription: (show: boolean) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MobileNewTaskScreen: React.FC<MobileNewTaskScreenProps> = (props) => {
    const {
        navigate, location, user, projects, users, loadingUsers,
        taskLevel, title, description, projectId, assignedToId, estimatedTime, deadline, startDate,
        submitting, error, showQuickActions, showDescription, selectedProject,
        setTaskLevel, setTitle, setDescription, setProjectId, setAssignedToId, setEstimatedTime,
        setDeadline, setStartDate, setShowQuickActions, setShowDescription, handleSubmit, handleKeyDown
    } = props;

    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 bg-background-dark border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                <h1 className="text-lg font-bold text-white flex-1 text-center">
                    {title || 'Nova Tarefa'}
                </h1>
                <button className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical size={24} />
                </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Cover Image Placeholder */}
                <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <Image size={24} className="text-white/50" />
                        </div>
                    </div>
                    <button className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white/80 border border-white/20">
                        <Image size={14} /> Capa
                    </button>
                </div>

                {/* Title Input */}
                <div className="px-4 py-4 border-b border-gray-800">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex-shrink-0 mt-1" />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nome da tarefa..."
                            className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Project Selection */}
                {!location.state?.projectId && (
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Folder size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">
                                    {selectedProject?.title || 'Selecionar Projeto'}
                                </p>
                                <p className="text-gray-500 text-xs">Produção</p>
                            </div>
                        </div>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="bg-transparent text-primary text-sm font-medium cursor-pointer focus:outline-none"
                        >
                            <option value="" className="bg-gray-900">Mover</option>
                            {projects.map((project: any) => (
                                <option key={project.id} value={project.id} className="bg-gray-900">
                                    {project.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Quick Actions Section */}
                <div className="border-b border-gray-800">
                    <button
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className="w-full px-4 py-3 flex items-center justify-between text-gray-400"
                    >
                        <span className="text-sm font-medium">Ações rápidas</span>
                        {showQuickActions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {showQuickActions && (
                        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDescription(!showDescription)}
                                className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium text-sm"
                            >
                                <CheckSquare size={18} /> Adicionar descrição
                            </button>
                            <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium text-sm">
                                <Paperclip size={18} /> Adicionar anexo
                            </button>
                            <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium text-sm">
                                <Users size={18} /> Membros
                            </button>
                        </div>
                    )}
                </div>

                {/* Description (Collapsible) */}
                {showDescription && (
                    <div className="px-4 py-4 border-b border-gray-800">
                        <div className="flex items-start gap-3">
                            <AlignLeft size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Adicionar descrição..."
                                className="flex-1 bg-gray-800/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Fields List */}
                <div className="divide-y divide-gray-800">
                    {/* Etiquetas/Tags */}
                    <div className="px-4 py-4 flex items-center gap-4">
                        <Tag size={20} className="text-gray-500" />
                        <span className="text-gray-400 text-sm flex-1">Etiquetas</span>
                    </div>

                    {/* Responsável/Assignee */}
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-4 mb-2">
                            <User size={20} className="text-gray-500" />
                            <span className="text-gray-400 text-sm flex-1">Responsável</span>
                        </div>
                        <div className="ml-9">
                            <MemberSelect
                                members={users}
                                selectedId={assignedToId}
                                onChange={setAssignedToId}
                                loading={loadingUsers}
                                placeholder="Atribuir a..."
                                allowUnassigned={true}
                                unassignedLabel="Sem responsável"
                            />
                        </div>
                    </div>

                    {/* Data de início */}
                    <div className="px-4 py-4 flex items-center gap-4">
                        <Clock size={20} className="text-gray-500" />
                        <div className="flex-1">
                            <span className="text-gray-400 text-sm block mb-1">Data de início</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-white text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Data de entrega */}
                    <div className="px-4 py-4 flex items-center gap-4">
                        <Calendar size={20} className="text-gray-500" />
                        <div className="flex-1">
                            <span className="text-gray-400 text-sm block mb-1">Data de entrega</span>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="bg-transparent text-white text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Tempo Estimado */}
                    <div className="px-4 py-4 flex items-center gap-4">
                        <Clock size={20} className="text-gray-500" />
                        <div className="flex-1">
                            <span className="text-gray-400 text-sm block mb-1">Tempo estimado (horas)</span>
                            <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                placeholder="Ex: 4"
                                className="bg-transparent text-white text-sm focus:outline-none placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Nível da Tarefa */}
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-4 mb-3">
                            <BarChart3 size={20} className="text-gray-500" />
                            <span className="text-gray-400 text-sm">Nível da Tarefa</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 ml-9">
                            {[
                                { id: 'basic', label: 'Básica', pts: 50, color: 'emerald' },
                                { id: 'medium', label: 'Média', pts: 100, color: 'amber' },
                                { id: 'large', label: 'Grande', pts: 200, color: 'red' }
                            ].map((level) => (
                                <button
                                    key={level.id}
                                    type="button"
                                    onClick={() => setTaskLevel(level.id as any)}
                                    className={`py-2.5 px-2 rounded-xl text-center transition-all ${taskLevel === level.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="text-xs font-medium mb-0.5">{level.label}</div>
                                    <div className="text-xs opacity-80">{level.pts} 🪙</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Anexos */}
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Paperclip size={20} className="text-gray-500" />
                            <span className="text-gray-400 text-sm">Anexos</span>
                        </div>
                        <button className="text-primary">
                            <span className="text-xl">+</span>
                        </button>
                    </div>

                    {/* Checklists */}
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CheckSquare size={20} className="text-gray-500" />
                            <span className="text-gray-400 text-sm">Checklists</span>
                        </div>
                        <button className="text-primary">
                            <span className="text-xl">+</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-4 my-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background-dark border-t border-gray-800 px-4 py-3">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !title || !projectId}
                    className="w-full py-3 bg-primary rounded-xl text-white font-semibold text-base shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Clock size={20} className="animate-spin" />
                            <span>Salvando...</span>
                        </>
                    ) : (
                        <>
                            <Check size={20} />
                            <span>Criar Tarefa</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MobileNewTaskScreen;
