import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectKanban } from '../hooks/useProjectKanban';
import { Skeleton } from '../components/Skeleton';
import MobileNewTaskModal from '../components/MobileNewTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ProjectRequestsModal from '../components/ProjectRequestsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { ProjectMembersCarousel } from '../components/ProjectMembersCarousel';
import { COLUMN_COLORS } from '../constants';
import { ArrowLeft, MoreVertical, Plus, Filter, Search, Calendar, User, CheckCircle2, Circle, Edit, Trash2, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetailsScreenMobile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        project, loadingProject, loadingKanban, columns, user,
        isNewTaskModalOpen, setIsNewTaskModalOpen,
        selectedTask, setSelectedTask, isTaskDetailsOpen, setIsTaskDetailsOpen,
        initialColumnId, setInitialColumnId,
        refetchKanban,
        handleAddColumn,
        handleMoveTask, handleToggleCompletion,
        handleDeleteTask, confirmDeleteTask, taskToDelete, setTaskToDelete,
        isRequestsModalOpen, setIsRequestsModalOpen, pendingRequestsCount, fetchRequestsCount
    } = useProjectKanban(id!);

    const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const longPressTimer = useRef<any>(null);

    const handleTouchStart = (task: any) => {
        longPressTimer.current = setTimeout(() => {
            setActiveDropdownId(task.id);
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500); // 500ms long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
           if (activeDropdownId && !(event.target as Element).closest('.task-dropdown-trigger') && !(event.target as Element).closest('.task-dropdown-menu')) {
               setActiveDropdownId(null);
           }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdownId]);

    const getColumnName = (colId: string) => {
        return columns?.find((c: any) => c.id === colId)?.title || 'Coluna';
    };

    const getColumnStyles = (column: any) => {
        const lowerTitle = column.title?.toLowerCase() || '';

        if (column.isCompletionColumn) return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
        if (column.color && COLUMN_COLORS[column.color as keyof typeof COLUMN_COLORS]) {
            const theme = COLUMN_COLORS[column.color as keyof typeof COLUMN_COLORS];
            return { color: theme.text, bg: theme.bg.split(' ')[0], border: theme.border.split(' ')[0] };
        }
        
        const config = [
            { keywords: ['fazer', 'todo', 'backlog'], styles: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" } },
            { keywords: ['progresso', 'fazendo', 'doing'], styles: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" } },
            { keywords: ['concluido', 'feito', 'done'], styles: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" } }
        ];

        return config.find(c => c.keywords.some(k => lowerTitle.includes(k)))?.styles || { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
    };

    const getPriorityBadge = (priority: string) => {
         if (!priority || priority === 'Geral') return null;
         const map: any = { 'Baixa': 'bg-slate-100 text-slate-600', 'Média': 'bg-orange-100 text-orange-600', 'Alta': 'bg-red-100 text-red-600', 'Urgente': 'bg-red-600 text-white' };
         return <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${map[priority] || 'bg-gray-100'}`}>{priority}</span>;
    };

    if (loadingProject || loadingKanban) return (
        <div className="flex flex-col h-screen bg-surface-light dark:bg-background-dark p-4 space-y-4">
            <Skeleton width="100%" height={60} />
            <div className="flex gap-2 overflow-hidden"><Skeleton width={100} height={40} /><Skeleton width={100} height={40} /><Skeleton width={100} height={40} /></div>
            <div className="space-y-3"><Skeleton width="100%" height={100} /><Skeleton width="100%" height={100} /></div>
        </div>
    );

    if (!project) return <div className="p-8 text-center text-gray-500">Projeto não encontrado</div>;

    const activeColumn = columns?.find((c: any) => c.id === activeColumnId);

const isProjectMember = user && project?.members?.some((m: any) => m.user?.id === user.id);

    return (
        <div className="flex flex-col h-[100dvh] bg-surface-light dark:bg-background-dark overflow-hidden">
            {/* Pending Requests Banner */}
            {pendingRequestsCount > 0 && (
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between animate-in slide-in-from-top duration-500 relative z-20">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-icons text-sm">group_add</span>
                        <span className="text-[11px] font-bold">
                            {pendingRequestsCount} {pendingRequestsCount === 1 ? 'solicitação pendente' : 'solicitações pendentes'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsRequestsModalOpen(true)}
                        className="bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                    >
                        Ver
                    </button>
                </div>
            )}
            
            {/* Mobile Header */}
            <header className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={() => navigate('/projects')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="overflow-hidden flex-1">
                        <h1 className="font-bold text-lg text-secondary dark:text-gray-100 leading-tight truncate">{project.title}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.members?.length || 0} membros</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {user && !isProjectMember && (
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    const { joinProject } = await import('../services/project.service');
                                    await joinProject(id!);
                                    toast.success('Você entrou no projeto com sucesso!');
                                    window.location.reload();
                                } catch (err: any) {
                                    toast.error(err.response?.data?.message || 'Erro ao entrar no projeto.');
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium mr-1 transition-colors whitespace-nowrap"
                        >
                            Entrar
                        </button>
                    )}
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                        <Search size={20} />
                    </button>
                    <button 
                         onClick={() => setIsMenuOpen(!isMenuOpen)}
                         className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Tabs for Columns */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex px-4 gap-4 min-w-max">
                    {columns?.map((col: any) => {
                        const style = getColumnStyles(col);
                        const isActive = activeColumnId === col.id;
                        return (
                            <button
                                key={col.id}
                                onClick={() => setActiveColumnId(col.id)}
                                className={`py-6 relative text-sm font-bold transition-colors flex items-center gap-2 ${isActive ? style.color : 'text-gray-400'}`}
                            >
                                {col.title}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? style.bg : 'bg-gray-100 text-gray-400'}`}>
                                    {col.tasks?.length || 0}
                                </span>
                                {isActive && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.color.replace('text', 'bg')}`} />
                                )}
                            </button>
                        );
                    })}
                    {isProjectMember && (
                        <button onClick={handleAddColumn} className="py-4 text-sm font-bold text-gray-400 flex items-center gap-1 px-2">
                            <Plus size={16} /> Nova
                        </button>
                    )}
                </div>
            </div>

            {/* Task List (Body) */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/20 p-4 space-y-3 pb-24">
                {project.members && project.members.length > 0 && (
                    <div className="mb-6 -mx-2">
                        <ProjectMembersCarousel members={project.members} />
                    </div>
                )}

                {activeColumn?.tasks?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="material-icons text-3xl opacity-50">assignment</span>
                        </div>
                        <p className="text-sm font-medium">Nenhuma tarefa nesta coluna</p>
                    </div>
                ) : (
                    activeColumn?.tasks?.map((task: any) => (
                        <div 
                            key={task.id} 
                            onClick={(e) => {
                                // Prevent opening modal if clicking dropdown or trigger
                                if ((e.target as Element).closest('.task-dropdown-trigger') || (e.target as Element).closest('.task-dropdown-menu')) return;
                                setSelectedTask(task); setIsTaskDetailsOpen(true);
                            }}
                            onTouchStart={() => handleTouchStart(task)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                            className={`bg-white dark:bg-surface-dark p-4 rounded-xl border transition-all touch-manipulation relative ${activeDropdownId === task.id ? 'border-primary ring-1 ring-primary/30 z-10' : 'border-gray-200 dark:border-gray-800 shadow-sm active:scale-[0.98]'}`}
                        >
                            <div className="flex justify-between items-start mb-2 relative">
                                {getPriorityBadge(task.priority)}
                                
                                {isProjectMember && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownId(activeDropdownId === task.id ? null : task.id);
                                        }}
                                        className="task-dropdown-trigger p-1 -mr-2 -mt-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                )}

                                {/* Dropdown Menu */}
                                {activeDropdownId === task.id && isProjectMember && (
                                    <div className="task-dropdown-menu absolute right-0 top-8 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTask(task);
                                                setIsTaskDetailsOpen(true);
                                                setActiveDropdownId(null);
                                            }}
                                            className="px-4 py-3 text-sm text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        
                                        <div className="border-t border-gray-100 dark:border-gray-800 my-1">
                                            <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mover para</div>
                                            {columns?.filter((col: any) => col.id !== activeColumnId && col.title !== 'Arquivado').map((col: any) => (
                                                <button
                                                    key={col.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveTask(task.id, col.id);
                                                        setActiveDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between group"
                                                >
                                                    <span className="truncate flex-1">{col.title}</span>
                                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTask(task.id);
                                                    setActiveDropdownId(null);
                                                }}
                                                className="w-full px-4 py-3 text-sm text-left flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            >
                                                <Trash2 size={16} /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {task.pointsReward > 0 && (
                                <div className="absolute top-4 right-12 z-0">
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                        <span className="material-icons text-xs">bolt</span> {task.pointsReward}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-start gap-2 mb-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleCompletion(task); setActiveDropdownId(null); }}
                                    className={`flex-shrink-0 mt-0.5 transition-colors ${task.completedAt ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500'}`}
                                    title={task.completedAt ? 'Marcar como não concluído' : 'Marcar como concluído'}
                                >
                                    {task.completedAt ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </button>
                                <h3 className={`font-bold text-sm ${task.completedAt ? 'line-through text-gray-400' : 'text-secondary dark:text-gray-100'}`}>
                                    {task.title}
                                </h3>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    {(task.assignees?.length > 0) ? (
                                        <div className="flex -space-x-2">
                                            {task.assignees.map((a: any, i: number) => (
                                                <img key={i} src={a.user?.avatarUrl || `https://ui-avatars.com/api/?name=${a.user?.name || 'User'}&background=random`} className="w-6 h-6 rounded-full border border-white" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <User size={14} /> <span>Sem resp.</span>
                                        </div>
                                    )}
                                </div>
                                {(task.dueDate) && (
                                     <div className="flex items-center gap-1 text-gray-400">
                                        <Calendar size={14} />
                                        <span>{new Date(task.dueDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB Add Task */}
            {isProjectMember && (
                <button
                    onClick={() => {
                        setInitialColumnId(activeColumnId || undefined);
                        setIsNewTaskModalOpen(true);
                    }}
                    className="fixed right-5 bottom-20 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-30 hover:scale-110 active:scale-90 transition-all font-bold"
                >
                    <Plus size={28} />
                </button>
            )}

            {/* Modals */}
            <MobileNewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                projectId={id}
                onSuccess={() => {
                    refetchKanban();
                    window.dispatchEvent(new Event('pointsUpdated'));
                }}
            />
             <TaskDetailModal
                isOpen={isTaskDetailsOpen}
                onClose={() => { setIsTaskDetailsOpen(false); setSelectedTask(null); }}
                onSuccess={() => {
                    refetchKanban();
                    window.dispatchEvent(new Event('pointsUpdated'));
                }}
                task={selectedTask}
                projectMembers={project?.members}
                columns={columns}
            />

            <ProjectRequestsModal 
                isOpen={isRequestsModalOpen}
                onClose={() => {
                    setIsRequestsModalOpen(false);
                    fetchRequestsCount();
                }}
                projectId={id!}
            />

            {/* Project Management Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl p-2 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-secondary dark:text-white">Opções do Projeto</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {(user?.role === 'ADMIN' || project.leaderId === user?.id) && (
                                <button 
                                    onClick={() => { navigate(`/project-requests/${id}`); setIsMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <span className="material-icons text-primary">group_add</span>
                                    Solicitações de Entrada
                                </button>
                            )}
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X size={20} /> Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            <ConfirmationModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={confirmDeleteTask}
                title="Excluir Tarefa"
                message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita e os pontos serão revogados."
                confirmText="Sim, excluir"
                type="danger"
            />
        </div>
    );
};

export default ProjectDetailsScreenMobile;
