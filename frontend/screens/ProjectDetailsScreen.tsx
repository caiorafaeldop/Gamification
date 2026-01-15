import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../components/StrictModeDroppable';
import { deleteTask, getProjectKanban, updateTaskStatus, createColumn, updateColumn, deleteColumn, reorderColumns } from '../services/task.service';
import { getProfile } from '../services/user.service';
import { uploadProjectCover, updateProject } from '../services/project.service';
import { useProjectDetails } from '../hooks/useProjects';
import { Skeleton } from '../components/Skeleton';
import NewTaskModal from '../components/NewTaskModal';
import { Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskDetailsModal from '../components/TaskDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const ProjectDetailsScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { project, loading: loadingProject } = useProjectDetails(id!);
    const [columns, setColumns] = useState<any>(null);
    const [loadingKanban, setLoadingKanban] = useState(true);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [initialColumnId, setInitialColumnId] = useState<string | undefined>(undefined);

    // Column Editing State
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const scrollInterval = useRef<any>(null);

    // Grab-to-scroll state for desktop
    const [isGrabScrolling, setIsGrabScrolling] = useState(false);
    const grabStartX = useRef(0);
    const grabScrollLeft = useRef(0);

    const handleGrabMouseDown = (e: React.MouseEvent) => {
        // Prevent if dragging a task or clicking interactive elements
        if (isDragging || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
        // Check if we are clicking the background or a non-draggable area
        if ((e.target as HTMLElement).closest('[data-rbd-drag-handle-context-id]')) return;

        setIsGrabScrolling(true);
        grabStartX.current = e.pageX - kanbanRef.current!.offsetLeft;
        grabScrollLeft.current = kanbanRef.current!.scrollLeft;
    };

    const handleGrabMouseMove = (e: React.MouseEvent) => {
        if (!isGrabScrolling || !kanbanRef.current) return;
        e.preventDefault();
        const x = e.pageX - kanbanRef.current.offsetLeft;
        const walk = (x - grabStartX.current) * 1; // Sensitivity
        kanbanRef.current.scrollLeft = grabScrollLeft.current - walk;
    };

    const stopGrabScrolling = () => setIsGrabScrolling(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMemberFilters, setSelectedMemberFilters] = useState<string[]>([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
    const kanbanRef = useRef<HTMLDivElement>(null);

    // Minimize header on mobile scroll
    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (window.innerWidth < 1024) { // Only mobile
                if (target.scrollTop > 20) {
                    setIsHeaderMinimized(true);
                } else if (target.scrollTop <= 10) {
                    setIsHeaderMinimized(false);
                }
            }
        };

        const kanbanArea = kanbanRef.current;
        if (kanbanArea) {
            // We listen to all vertical scroll events inside the board
            kanbanArea.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            if (kanbanArea) {
                kanbanArea.removeEventListener('scroll', handleScroll, true);
            }
        };
    }, []);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.innerWidth >= 1024) return;
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart || window.innerWidth >= 1024) return;
        const currentTouch = e.targetTouches[0].clientY;
        const diff = touchStart - currentTouch;

        // Swipe Up to hide, Swipe Down to show
        if (diff > 50) {
            setIsHeaderMinimized(true);
            setTouchStart(null);
        } else if (diff < -50) {
            setIsHeaderMinimized(false);
            setTouchStart(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
        };

        if (isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    useEffect(() => {
        if (editingColumnId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingColumnId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getProfile();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };
        fetchUser();
    }, []);

    const isLeaderOrAdmin = user && (
        project?.leaderId === user.id ||
        project?.leader?.id === user.id ||
        user.role === 'ADMIN'
    );

    // Task Details Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

    // Delete Confirmation State
    const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchKanban();
    }, [id]);

    const fetchKanban = async () => {
        try {
            const data = await getProjectKanban(id!);
            setColumns(data);
        } catch (err) {
            console.error("Failed to fetch kanban", err);
        } finally {
            setLoadingKanban(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB');
                return;
            }

            setUploadingCover(true);
            try {
                const response = await uploadProjectCover(file);
                await updateProject(id!, { coverUrl: response.url });
                // We should refresh project details or just local state
                window.location.reload(); // Quickest way to refresh everything including hook state
                toast.success('Capa do projeto atualizada!');
            } catch (error) {
                console.error('Error upload:', error);
                toast.error('Erro ao fazer upload da imagem.');
            } finally {
                setUploadingCover(false);
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
        try {
            await deleteTask(taskId);
            fetchKanban(); // Refresh
        } catch (err: any) {
            console.error("Failed to delete task", err);
            alert(err.response?.data?.message || "Erro ao excluir tarefa");
        }
    };

    const onDragStart = (start: any) => {
        setIsDragging(true);
        if (window.innerWidth < 1024) {
            setIsHeaderMinimized(true);
        }
    };

    // Auto-scroll logic during drag
    useEffect(() => {
        if (!isDragging) {
            if (scrollInterval.current) {
                clearInterval(scrollInterval.current);
                scrollInterval.current = null;
            }
            return;
        }

        const handleMove = (clientX: number) => {
            const threshold = 80; // Smaller threshold for mobile common areas
            const width = window.innerWidth;
            const speed = 12;

            if (scrollInterval.current) {
                clearInterval(scrollInterval.current);
                scrollInterval.current = null;
            }

            if (clientX > width - threshold) {
                scrollInterval.current = setInterval(() => {
                    if (kanbanRef.current) kanbanRef.current.scrollLeft += speed;
                }, 16);
            } else if (clientX < threshold) {
                scrollInterval.current = setInterval(() => {
                    if (kanbanRef.current) kanbanRef.current.scrollLeft -= speed;
                }, 16);
            }
        };

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches && e.touches.length > 0) {
                handleMove(e.touches[0].clientX);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        };
    }, [isDragging]);

    const onDragEnd = async (result: any) => {
        setIsDragging(false);
        if (!result.destination) return;
        const { source, destination, draggableId, type } = result;

        // Same position - no change needed
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        if (type === 'column') {
            const newColumns = [...columns];
            const [removed] = newColumns.splice(source.index, 1);
            newColumns.splice(destination.index, 0, removed);
            setColumns(newColumns);

            try {
                await reorderColumns(id!, newColumns.map(c => c.id));
            } catch (err) {
                console.error("Failed to reorder columns", err);
                fetchKanban();
            }
            return;
        }

        // Task drag - Optimistic Update
        const sourceColIndex = columns.findIndex((c: any) => c.id === source.droppableId);
        const destColIndex = columns.findIndex((c: any) => c.id === destination.droppableId);

        if (sourceColIndex === -1 || destColIndex === -1) return;

        // Deep copy of columns for optimistic interaction
        const newColumns = columns.map((col: any) => ({
            ...col,
            tasks: [...col.tasks]
        }));

        const [movedTask] = newColumns[sourceColIndex].tasks.splice(source.index, 1);

        // Update task's local status/column if needed (depends on how your data is structured)
        // movedTask.columnId = destination.droppableId; 

        newColumns[destColIndex].tasks.splice(destination.index, 0, movedTask);

        setColumns(newColumns);

        try {
            await updateTaskStatus(draggableId, destination.droppableId);
            // Optionally fetch to sync with server (e.g. for points, history, or reordering persistence)
            // fetchKanban(); 
        } catch (err) {
            console.error("Failed to move task", err);
            fetchKanban(); // Revert on failure
        }
    };

    const handleAddColumn = async () => {
        try {
            const defaultTitle = "Nova Coluna";
            // Create column with default title
            const newColumn = await createColumn(id!, defaultTitle, columns.length);

            // Refresh kanban to get the updated list including the new column
            await fetchKanban();

            // Enter edit mode for the new column
            setEditingColumnId(newColumn.id);
            setEditingTitle(defaultTitle);
        } catch (err) {
            console.error("Failed to create column", err);
            toast.error("Erro ao criar coluna");
        }
    };

    const startEditing = (columnId: string, currentTitle: string) => {
        setEditingColumnId(columnId);
        setEditingTitle(currentTitle);
    };

    const handleSaveColumnTitle = async () => {
        if (!editingColumnId) return;

        if (!editingTitle.trim()) {
            toast.error("O nome da coluna não pode ser vazio");
            return;
        }

        // Optimistic update
        const newColumns = columns.map((col: any) =>
            col.id === editingColumnId ? { ...col, title: editingTitle } : col
        );
        setColumns(newColumns);

        const idToUpdate = editingColumnId;
        const titleToUpdate = editingTitle;

        // Close edit mode immediately
        setEditingColumnId(null);

        try {
            await updateColumn(idToUpdate, { title: titleToUpdate });
        } catch (err) {
            console.error("Failed to update column", err);
            toast.error("Erro ao atualizar nome da coluna");
            fetchKanban(); // Revert
        }
    };



    const handleDeleteColumn = (columnId: string) => {
        setColumnToDelete(columnId);
    };

    const confirmDeleteColumn = async () => {
        if (!columnToDelete) return;

        try {
            await deleteColumn(columnToDelete);
            fetchKanban();
            toast.success("Coluna excluída com sucesso!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Erro ao excluir coluna");
        } finally {
            setColumnToDelete(null);
        }
    };

    const toggleMemberFilter = (memberId: string) => {
        setSelectedMemberFilters(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const getFilteredColumns = () => {
        if (!columns) return null;
        // If no filters are active, return original columns
        if (selectedMemberFilters.length === 0 && !searchQuery.trim()) return columns;

        return columns.map((col: any) => ({
            ...col,
            tasks: col.tasks.filter((task: any) => {
                // 1. Filter by Members
                let matchesMember = true;
                if (selectedMemberFilters.length > 0) {
                    const isUnassigned = !task.assignedTo;
                    const matchesUnassigned = selectedMemberFilters.includes('unassigned') && isUnassigned;
                    const matchesSpecific = task.assignedTo && selectedMemberFilters.includes(task.assignedTo.id);
                    matchesMember = matchesUnassigned || matchesSpecific;
                }

                // 2. Filter by Search Query
                let matchesSearch = true;
                if (searchQuery.trim()) {
                    matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
                }

                return matchesMember && matchesSearch;
            })
        }));
    };

    const displayedColumns = getFilteredColumns();
    // Disable drag if ANY filter is active (member or search)
    const isDragDisabled = selectedMemberFilters.length > 0 || !!searchQuery.trim();

    const getColumnStyles = (title: string) => {
        const lowerTitle = title.toLowerCase();

        const config = [
            {
                keywords: ['fazer', 'todo', 'backlog'],
                styles: {
                    container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="w-3 h-3 rounded-full bg-slate-400"></span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }
            },
            {
                keywords: ['progresso', 'fazendo', 'doing', 'progress'],
                styles: {
                    container: "bg-primary/5 dark:bg-surface-dark/60 border-t-4 border-t-primary border-x border-b border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="material-icons text-primary animate-spin text-sm" style={{ animationDuration: '3s' }}>sync</span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-primary/20 text-primary"
                }
            },
            {
                keywords: ['concluido', 'feito', 'done', 'finished'],
                styles: {
                    container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                    headerIcon: <span className="material-icons text-emerald-500 text-sm">check_circle</span>,
                    titleColor: "text-gray-700 dark:text-gray-200",
                    badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                }
            }
        ];

        const match = config.find(c => c.keywords.some(k => lowerTitle.includes(k)));
        return match ? match.styles : {
            container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
            headerIcon: <span className="w-3 h-3 rounded-full bg-slate-400"></span>,
            titleColor: "text-gray-700 dark:text-gray-200",
            badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        };
    };

    const getPriorityBadge = (priority: string) => {
        // Logic to return badge styles based on priority if available
        return (
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {priority || 'Geral'}
            </span>
        );
    };

    if (loadingProject || loadingKanban) return (
        <div className="flex-1 flex flex-col h-full bg-surface-light dark:bg-background-dark relative overflow-hidden">
            {/* Header Skeleton */}
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
                        {/* Actions */}
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} width={40} height={40} variant="circular" className="border-2 border-white dark:border-secondary" />)}
                            </div>
                            <Skeleton width={140} height={44} className="rounded-lg" />
                        </div>
                    </div>
                    {/* Toolbar */}
                    <div className="mt-8 flex flex-wrap justify-between gap-4">
                        <div className="flex gap-2">
                            <Skeleton width={100} height={40} className="rounded-lg" />
                            <Skeleton width={100} height={40} className="rounded-lg" />
                            <Skeleton width={100} height={40} className="rounded-lg" />
                        </div>
                        <Skeleton width={250} height={40} className="rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Kanban Skeleton */}
            <div className="flex-1 overflow-x-auto p-6 flex gap-6">
                {[1, 2, 3, 4].map(col => (
                    <div key={col} className="flex-1 min-w-[320px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-surface-dark/30 h-full flex flex-col">
                        {/* Column Header */}
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                            <Skeleton width={120} height={24} />
                            <Skeleton width={24} height={24} variant="circular" />
                        </div>
                        {/* Cards */}
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
    if (!project) return <div className="p-8 text-center">Projeto não encontrado</div>;

    return (
        <div className="flex-1 flex flex-col relative h-full">
            <div className="absolute inset-0 z-0 bg-network-pattern opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <div
                className={`bg-surface-light/80 dark:bg-secondary/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 transition-all duration-300 flex-shrink-0 relative group ${isHeaderMinimized ? 'pt-2 pb-1 px-4' : 'p-6'
                    }`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {/* Project Cover Background */}
                {project.coverUrl && !isHeaderMinimized && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img src={project.coverUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-light dark:to-background-dark"></div>
                    </div>
                )}

                {/* Cover Upload Overlay */}
                {isLeaderOrAdmin && !isHeaderMinimized && (
                    <label className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                        {uploadingCover ? (
                            <Loader className="animate-spin" size={16} />
                        ) : (
                            <>
                                <Camera size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Alterar Capa</span>
                            </>
                        )}
                    </label>
                )}

                <div className="max-w-full mx-auto relative z-10">
                    <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center transition-all duration-300 ${isHeaderMinimized ? 'gap-2' : 'gap-6'
                        }`}>
                        <div className={`space-y-2 max-w-2xl transition-all duration-300 ${isHeaderMinimized ? 'hidden lg:block' : 'block'}`}>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span onClick={() => navigate('/projects')} className="hover:text-primary cursor-pointer">Projetos</span>
                                <span className="material-icons text-xs">chevron_right</span>
                                <span className="text-primary font-bold">Detalhes</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h1 className={`${isHeaderMinimized ? 'text-lg truncate max-w-[200px]' : 'text-3xl'} transition-all duration-300 font-display font-extrabold text-secondary dark:text-white lg:max-w-none`}>{project.title}</h1>
                                {!isHeaderMinimized && (
                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">
                                        {project.status}
                                    </span>
                                )}
                            </div>
                            {!isHeaderMinimized && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        <div className={`flex flex-col lg:flex-row items-end lg:items-center transition-all duration-300 ${isHeaderMinimized ? 'hidden lg:flex' : 'flex'
                            } gap-6`}>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {project.members?.slice(0, 4).map((m: any, idx: number) => (
                                        <img
                                            key={idx}
                                            alt={m.user?.name || 'Member'}
                                            className="w-10 h-10 rounded-full border-2 border-white dark:border-secondary shadow-sm object-cover"
                                            src={m.user?.avatarUrl || `https://ui-avatars.com/api/?name=${m.user?.name || 'User'}&background=random`}
                                            title={m.user?.name}
                                        />
                                    ))}
                                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-surface-dark border-2 border-white dark:border-secondary flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <span className="material-icons text-sm">add</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 border-l border-gray-300 dark:border-gray-700 pl-4 h-10">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                                        {project.leader?.avatarUrl ? (
                                            <img src={project.leader.avatarUrl} alt={project.leader.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-gray-500 font-bold text-xs">{project.leader?.name?.substring(0, 2).toUpperCase()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] lg:text-xs text-gray-500 uppercase font-bold">Líder do Projeto</p>
                                        <p className="text-xs lg:text-sm font-bold text-secondary dark:text-white truncate max-w-[100px] lg:max-w-none">{project.leader?.name || "Desconhecido"}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Desktop only: Nova Tarefa na posição original */}
                            <button
                                onClick={() => { setInitialColumnId(undefined); setIsNewTaskModalOpen(true); }}
                                className="hidden lg:flex bg-primary hover:bg-sky-400 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all items-center gap-2"
                            >
                                <span className="material-icons text-sm">add</span>
                                Nova Tarefa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white dark:bg-surface-dark text-primary font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <span className="material-icons text-sm">view_kanban</span>
                            Quadro
                        </button>
                        {/* Mobile only: Nova Tarefa ao lado do Quadro */}
                        <button
                            onClick={() => { setInitialColumnId(undefined); setIsNewTaskModalOpen(true); }}
                            className="lg:hidden bg-primary hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">add</span>
                            Nova Tarefa
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                            <input
                                className="pl-9 pr-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 dark:text-white dark:placeholder-gray-400 outline-none"
                                placeholder="Buscar tarefas..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative" ref={filterMenuRef}>
                            <button
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                className={`p-2 transition-all rounded-lg flex items-center gap-2 ${selectedMemberFilters.length > 0
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold'
                                    : 'text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-icons">filter_list</span>
                                {selectedMemberFilters.length > 0 && (
                                    <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">
                                        {selectedMemberFilters.length}
                                    </span>
                                )}
                            </button>

                            {isFilterMenuOpen && (
                                <div className="absolute right-0 top-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 w-72 p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">Filtrar por responsável</h4>
                                    </div>
                                    <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {/* Unassigned Option */}
                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMemberFilters.includes('unassigned')}
                                                    onChange={() => toggleMemberFilter('unassigned')}
                                                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-surface-dark checked:bg-primary checked:border-primary transition-all"
                                                />
                                                <span className="material-icons absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-50 peer-checked:scale-100 transition-all">check</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all">?</div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sem responsável</span>
                                        </label>

                                        {/* Members */}
                                        {project?.members?.map((member: any) => (
                                            <label key={member.user?.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMemberFilters.includes(member.user?.id)}
                                                        onChange={() => toggleMemberFilter(member.user?.id)}
                                                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-surface-dark checked:bg-primary checked:border-primary transition-all"
                                                    />
                                                    <span className="material-icons absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-50 peer-checked:scale-100 transition-all">check</span>
                                                </div>
                                                <img
                                                    src={member.user?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user?.name}&background=random`}
                                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all"
                                                    alt={member.user?.name}
                                                />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{member.user?.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedMemberFilters.length > 0 && (
                                        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => { setSelectedMemberFilters([]); setIsFilterMenuOpen(false); }}
                                                className="w-full py-2 text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span className="material-icons text-sm">close</span>
                                                Limpar filtros
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pull Handle (Mobile Only) */}
                <div className="lg:hidden flex justify-center mt-2 -mb-2">
                    <button
                        onClick={() => setIsHeaderMinimized(!isHeaderMinimized)}
                        className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-primary transition-colors relative"
                        title={isHeaderMinimized ? "Expandir" : "Recolher"}
                    >
                        <span className={`material-icons absolute -top-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm transition-transform duration-300 ${isHeaderMinimized ? 'rotate-180' : ''}`}>
                            expand_less
                        </span>
                    </button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <div
                ref={kanbanRef}
                className={`flex-1 overflow-x-auto p-4 lg:p-6 transition-colors duration-500 custom-scrollbar-hide ${isDragging ? 'bg-gray-100/50 dark:bg-black/10' : ''
                    } ${isGrabScrolling ? 'cursor-grabbing select-none' : 'cursor-default'}`}
                onMouseDown={handleGrabMouseDown}
                onMouseMove={handleGrabMouseMove}
                onMouseUp={stopGrabScrolling}
                onMouseLeave={stopGrabScrolling}
            >
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <StrictModeDroppable droppableId="all-columns" direction="horizontal" type="column">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="h-full flex gap-6 min-w-max"
                            >
                                {displayedColumns && displayedColumns.map((column: any, index: number) => {
                                    const styles = getColumnStyles(column.title);
                                    return (
                                        <Draggable key={column.id} draggableId={column.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    {...provided.draggableProps}
                                                    ref={provided.innerRef}
                                                    className={`flex flex-col w-[320px] rounded-2xl border ${styles.container}`}
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing"
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            {styles.headerIcon}
                                                            {editingColumnId === column.id ? (
                                                                <input
                                                                    ref={inputRef}
                                                                    value={editingTitle}
                                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                                    onBlur={handleSaveColumnTitle}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleSaveColumnTitle();
                                                                        if (e.key === 'Escape') setEditingColumnId(null);
                                                                    }}
                                                                    className="font-display font-bold bg-white dark:bg-surface-dark border border-primary px-2 py-0.5 rounded text-sm w-full outline-none text-gray-800 dark:text-gray-100"
                                                                    onClick={(e) => e.stopPropagation()} // Prevent drag conflict if needed
                                                                />
                                                            ) : (
                                                                <>
                                                                    <h3 className={`font-display font-bold truncate ${styles.titleColor}`}>{column.title}</h3>
                                                                    <span className={`${styles.badge} text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0`}>{column.tasks.length}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => startEditing(column.id, column.title)}
                                                                className="p-1 text-gray-400 hover:text-blue-500"
                                                                title="Renomear"
                                                            >
                                                                <span className="material-icons text-sm">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteColumn(column.id)}
                                                                className="p-1 text-gray-400 hover:text-red-500"
                                                                title="Excluir"
                                                            >
                                                                <span className="material-icons text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <StrictModeDroppable droppableId={column.id} type="task">
                                                        {(provided) => (
                                                            <div
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                                className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3"
                                                            >
                                                                {column.tasks.map((task: any, index: number) => (
                                                                    <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                onClick={() => { setSelectedTask(task); setIsTaskDetailsOpen(true); }}
                                                                                className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 border-t-4 border-t-blue-500 cursor-grab hover:shadow-md hover:border-blue-500/50 group relative transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/40 rotate-1 z-50 scale-105' : ''
                                                                                    }`}
                                                                                style={{
                                                                                    ...provided.draggableProps.style,
                                                                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                                                }}
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
                                                                                        <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">chat_bubble_outline</span> 2</span>
                                                                                        <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">attach_file</span> 1</span>
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedTask(task);
                                                                                        setIsTaskDetailsOpen(true);
                                                                                    }}
                                                                                    className="absolute top-2 right-8 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <span className="material-icons text-sm">edit</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <span className="material-icons text-sm">delete</span>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                                <button
                                                                    onClick={() => { setInitialColumnId(column.id); setIsNewTaskModalOpen(true); }}
                                                                    className="w-full py-2 text-sm text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium border border-dashed border-gray-300 dark:border-gray-700"
                                                                >
                                                                    <span className="material-icons text-sm">add</span> Adicionar cartão
                                                                </button>
                                                            </div>
                                                        )}
                                                    </StrictModeDroppable>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}

                                {/* Add Column Button */}
                                <div className="w-[320px] flex-shrink-0 flex items-start">
                                    <button
                                        onClick={handleAddColumn}
                                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold"
                                    >
                                        <span className="material-icons">add</span>
                                        Nova Coluna
                                    </button>
                                </div>
                            </div>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            </div>
            <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                projectId={id}
                initialColumnId={initialColumnId}
                projectMembers={project?.members}
                onSuccess={fetchKanban}
            />

            <TaskDetailsModal
                isOpen={isTaskDetailsOpen}
                onClose={() => setIsTaskDetailsOpen(false)}
                task={selectedTask}
            />

            <ConfirmationModal
                isOpen={!!columnToDelete}
                onClose={() => setColumnToDelete(null)}
                onConfirm={confirmDeleteColumn}
                title="Excluir Coluna"
                message="Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita e apenas colunas vazias podem ser removidas."
                confirmText="Sim, excluir"
                type="danger"
            />
        </div>
    );
};

export default ProjectDetailsScreen;