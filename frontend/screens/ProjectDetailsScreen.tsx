import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../components/StrictModeDroppable';
import { deleteTask } from '../services/task.service';
import { getProjectBoard, moveTask, createColumn, updateColumn, deleteColumn, reorderColumns } from '../services/kanban.service';
import { useProjectDetails } from '../hooks/useProjects';
import { Skeleton } from '../components/Skeleton';
import NewTaskModal from '../components/NewTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';

const ProjectDetailsScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { project, loading: loadingProject } = useProjectDetails(id!);
    const [kanbanData, setKanbanData] = useState<{ board: any; columns: any[] } | null>(null);
    const [loadingKanban, setLoadingKanban] = useState(true);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(undefined);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState('');

    // Task Details Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

    useEffect(() => {
        if (id) fetchKanban();
    }, [id]);

    const fetchKanban = async () => {
        try {
            const data = await getProjectBoard(id!);
            setKanbanData(data);
        } catch (err) {
            console.error("Failed to fetch kanban", err);
        } finally {
            setLoadingKanban(false);
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnTitle.trim()) return;
        try {
            await createColumn(id!, newColumnTitle);
            setNewColumnTitle('');
            setIsAddingColumn(false);
            await fetchKanban();
        } catch (err: any) {
            console.error("Failed to add column", err);
            alert(err.response?.data?.message || "Erro ao adicionar coluna");
        }
    };

    const handleRenameColumn = async (columnId: string) => {
        if (!editingColumnTitle.trim()) return;
        const column = kanbanData?.columns.find(c => c.id === columnId);
        if (column && column.title === editingColumnTitle) {
            setEditingColumnId(null);
            return;
        }

        try {
            await updateColumn(columnId, { title: editingColumnTitle });
            setEditingColumnId(null);
            await fetchKanban();
        } catch (err: any) {
            console.error("Failed to rename column", err);
            alert(err.response?.data?.message || "Erro ao renomear coluna");
        }
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta coluna? As tarefas serão movidas para outra coluna.")) return;
        try {
            await deleteColumn(columnId);
            fetchKanban();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao excluir coluna");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
        try {
            await deleteTask(taskId);
            fetchKanban();
        } catch (err: any) {
            console.error("Failed to delete task", err);
            alert(err.response?.data?.message || "Erro ao excluir tarefa");
        }
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;
        const { source, destination, draggableId, type } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        if (type === 'COLUMN') {
            const newColumns = Array.from(kanbanData!.columns);
            const [removed] = newColumns.splice(source.index, 1);
            newColumns.splice(destination.index, 0, removed);

            const newState = {
                ...kanbanData!,
                columns: newColumns
            };

            setKanbanData(newState);

            try {
                const columnIds = newColumns.map(col => col.id);
                await reorderColumns(id!, columnIds);
            } catch (err) {
                console.error("Failed to reorder columns", err);
                fetchKanban();
            }
            return;
        }

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        const board = { ...kanbanData!.board };
        const sourceData = [...board[sourceColId]];
        const destData = sourceColId === destColId ? sourceData : [...board[destColId]];

        const [removed] = sourceData.splice(source.index, 1);

        if (sourceColId === destColId) {
            sourceData.splice(destination.index, 0, removed);
            setKanbanData({
                ...kanbanData!,
                board: { ...board, [sourceColId]: sourceData }
            });
        } else {
            removed.columnId = destColId;
            destData.splice(destination.index, 0, removed);
            setKanbanData({
                ...kanbanData!,
                board: { ...board, [sourceColId]: sourceData, [destColId]: destData }
            });

            try {
                await moveTask(draggableId, destColId);
            } catch (err) {
                console.error("Failed to move task", err);
                fetchKanban();
            }
        }
    };

    const getColumnStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'todo':
                return {
                    container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="w-3 h-3 rounded-full bg-slate-400"></span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                };
            case 'in_progress':
                return {
                    container: "bg-primary/5 dark:bg-surface-dark/60 border-t-4 border-t-primary border-x border-b border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="material-icons text-primary animate-spin text-sm" style={{ animationDuration: '3s' }}>sync</span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-primary/20 text-primary"
                };
            case 'done':
                return {
                    container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="material-icons text-emerald-500 text-sm">check_circle</span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                };
            default:
                return {
                    container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="w-3 h-3 rounded-full bg-slate-400"></span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                };
        }
    };

    const getPriorityBadge = (priority: string) => {
        return (
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {priority || 'Geral'}
            </span>
        );
    };

    if (loadingProject || loadingKanban) return (
        <div className="flex-1 flex flex-col h-full bg-surface-light dark:bg-background-dark relative overflow-hidden">
            <div className="bg-surface-light/80 dark:bg-secondary/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 p-6 flex-shrink-0">
                <div className="max-w-full mx-auto space-y-4">
                    <Skeleton width={200} height={20} className="mb-4" />
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-4 w-full max-w-2xl">
                            <div className="flex items-center gap-4">
                                <Skeleton width={300} height={40} />
                                <Skeleton width={100} height={24} variant="circular" />
                            </div>
                            <Skeleton width="100%" height={20} />
                            <Skeleton width="80%" height={20} />
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} width={40} height={40} variant="circular" className="border-2 border-white dark:border-secondary" />)}
                            </div>
                            <Skeleton width={140} height={44} className="rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto p-6 flex gap-6">
                {[1, 2, 3, 4].map(col => (
                    <div key={col} className="flex-1 min-w-[320px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-surface-dark/30 h-full flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                            <Skeleton width={120} height={24} />
                            <Skeleton width={24} height={24} variant="circular" />
                        </div>
                        <div className="p-3 space-y-3">
                            {[1, 2].map(card => (
                                <Skeleton key={card} height={120} className="w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!project) return <div className="p-8 text-center text-gray-500">Projeto não encontrado</div>;

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            <div className="absolute inset-0 z-0 bg-network-pattern opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <div className="bg-surface-light/80 dark:bg-secondary/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 p-6 flex-shrink-0">
                <div className="max-w-full mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span onClick={() => navigate('/projects')} className="hover:text-primary cursor-pointer">Projetos</span>
                                <span className="material-icons text-xs">chevron_right</span>
                                <span className="text-primary font-bold">Detalhes</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white leading-tight">{project.title}</h1>
                                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800 h-fit">
                                    {project.status || 'Ativo'}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{project.description}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {project.members && project.members.length > 0 ? (
                                        project.members.slice(0, 4).map((member: any, idx: number) => {
                                            const user = member.user || member;
                                            return (
                                                <img
                                                    key={idx}
                                                    alt={user.name || 'Membro'}
                                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-secondary shadow-sm object-cover hover:z-10 transition-all cursor-pointer"
                                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                                    title={user.name}
                                                />
                                            );
                                        })
                                    ) : null}
                                    {project.members?.length > 4 && (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-surface-dark border-2 border-white dark:border-secondary flex items-center justify-center text-xs font-bold text-gray-500 z-10">
                                            +{project.members.length - 4}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="w-10 h-10 rounded-full bg-gray-50 dark:bg-surface-dark/50 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all ml-1"
                                    >
                                        <span className="material-icons text-sm">add</span>
                                    </button>
                                </div>
                                <div className="hidden sm:block border-l border-gray-200 dark:border-gray-800 h-8 mx-1"></div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Líder do Projeto</p>
                                        <p className="text-sm font-bold text-secondary dark:text-white leading-tight">
                                            {project.leader?.name ||
                                                project.members?.find((m: any) => m.role === 'LEADER' || m.userId === project.leaderId || m.user?.id === project.leaderId)?.user?.name ||
                                                "Desconhecido"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedColumnId(undefined); setIsNewTaskModalOpen(true); }}
                                className="bg-primary hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2 group"
                            >
                                <span className="material-icons text-sm group-hover:rotate-90 transition-transform">add</span>
                                Nova Tarefa
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-white dark:bg-surface-dark text-primary font-bold rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                <span className="material-icons text-sm">view_kanban</span>
                                Quadro
                            </button>
                            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-surface-dark/50 font-medium rounded-lg flex items-center gap-2 transition-colors">
                                <span className="material-icons text-sm">format_list_bulleted</span>
                                Lista
                            </button>
                            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-surface-dark/50 font-medium rounded-lg flex items-center gap-2 transition-colors">
                                <span className="material-icons text-sm">calendar_month</span>
                                Cronograma
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                                <input
                                    className="pl-9 pr-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 w-64 dark:text-white dark:placeholder-gray-500 outline-none"
                                    placeholder="Buscar tarefas..."
                                    type="text"
                                />
                            </div>
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                <span className="material-icons">filter_list</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="h-full flex gap-6 min-w-max">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex gap-6 h-full"
                                >
                                    {kanbanData && kanbanData.columns.map((column: any, index: number) => {
                                        const tasks = kanbanData.board[column.id] || [];
                                        const styles = getColumnStyles(column.status);
                                        const isEditing = editingColumnId === column.id;

                                        return (
                                            <Draggable key={column.id} draggableId={column.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex-1 flex flex-col min-w-[320px] max-w-[350px] rounded-2xl border ${styles.container}`}
                                                    >
                                                        <div
                                                            className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800"
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                                <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary transition-colors">
                                                                    <span className="material-icons text-sm">drag_indicator</span>
                                                                </span>
                                                                {styles.headerIcon}
                                                                {isEditing ? (
                                                                    <input
                                                                        autoFocus
                                                                        className="bg-white dark:bg-surface-dark border border-primary/50 rounded px-2 py-0.5 text-sm focus:ring-1 focus:ring-primary outline-none w-full"
                                                                        value={editingColumnTitle}
                                                                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                                                                        onBlur={() => handleRenameColumn(column.id)}
                                                                        onKeyDown={handleRenameKeyDown}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    />
                                                                ) : (
                                                                    <h3
                                                                        className={`font-display font-bold truncate ${styles.titleColor} cursor-pointer hover:text-primary transition-colors`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            setEditingColumnId(column.id);
                                                                            setEditingColumnTitle(column.title);
                                                                        }}
                                                                    >
                                                                        {column.title}
                                                                    </h3>
                                                                )}
                                                                <span className={`${styles.badge} text-xs font-bold px-2 py-0.5 rounded-full`}>{tasks.length}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                    onClick={() => handleDeleteColumn(column.id)}
                                                                    title="Excluir coluna"
                                                                >
                                                                    <span className="material-icons text-sm">delete_outline</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <Droppable droppableId={column.id} type="TASK">
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className={`p-3 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                                >
                                                                    {tasks.map((task: any, index: number) => (
                                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    style={provided.draggableProps.style}
                                                                                    className="outline-none block"
                                                                                >
                                                                                    <div
                                                                                        onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                                                                                        className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab hover:shadow-md hover:border-primary/30 transition-all group relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary border-primary/50 rotate-2 z-50' : ''}`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            {getPriorityBadge(task.priority)}
                                                                                        </div>
                                                                                        <h4 className={`font-bold text-secondary dark:text-gray-100 text-sm mb-3 ${column.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                                                                            {task.title}
                                                                                        </h4>
                                                                                        <div className="flex items-center justify-between mt-3">
                                                                                            <div className="flex items-center -space-x-2">
                                                                                                {task.assignedTo ? (
                                                                                                    <img
                                                                                                        alt={task.assignedTo.name}
                                                                                                        className={`w-6 h-6 rounded-full border border-white dark:border-surface-dark ${column.status === 'done' ? 'grayscale' : ''}`}
                                                                                                        src={task.assignedTo.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignedTo.name}&background=random`}
                                                                                                    />
                                                                                                ) : (
                                                                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300 border border-white dark:border-surface-dark">?</div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                                                                                {column.status === 'done' && task.completedAt ? (
                                                                                                    <span className="text-gray-400">{new Date(task.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">chat_bubble_outline</span> 0</span>
                                                                                                        <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">attach_file</span> 0</span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => { e.stopPropagation(); navigate(`/edit-task/${task.id}`); }}
                                                                                            className="absolute top-2 right-8 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        >
                                                                                            <span className="material-icons text-sm">edit</span>
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        >
                                                                                            <span className="material-icons text-sm">delete</span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColumnId(column.id); setIsNewTaskModalOpen(true); }}
                                                                        className="w-full py-2 text-sm text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium border border-dashed border-gray-300 dark:border-gray-700"
                                                                    >
                                                                        <span className="material-icons text-sm">add</span> Adicionar cartão
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {/* Add Column Button */}
                    <div className="min-w-[320px] h-fit pr-8">
                        {isAddingColumn ? (
                            <div className="bg-white/50 dark:bg-surface-dark/50 border-2 border-dashed border-primary/30 rounded-2xl p-4 animate-in fade-in zoom-in duration-200">
                                <input
                                    autoFocus
                                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                    placeholder="Nome da coluna..."
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                                />
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={handleAddColumn}
                                        className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingColumn(false)}
                                        className="px-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddingColumn(true); }}
                                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-surface-dark flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <span className="material-icons">add</span>
                                </div>
                                <span className="text-sm font-bold">Adicionar Coluna</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => { setIsNewTaskModalOpen(false); setSelectedColumnId(undefined); }}
                projectId={id}
                columnId={selectedColumnId}
                onSuccess={fetchKanban}
            />

            <TaskDetailsModal
                isOpen={isTaskDetailsOpen}
                onClose={() => { setIsTaskDetailsOpen(false); setSelectedTask(null); }}
                task={selectedTask}
                onTaskUpdated={fetchKanban}
            />
        </div>
    );
};

export default ProjectDetailsScreen;