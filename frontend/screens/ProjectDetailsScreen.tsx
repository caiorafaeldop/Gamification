import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../components/StrictModeDroppable';
import { deleteTask, getProjectKanban, updateTaskStatus, createColumn, updateColumn, deleteColumn, reorderColumns, createQuickTask } from '../services/task.service';
import { getProfile } from '../services/user.service';
import { uploadProjectCover, updateProject, leaveProject, transferProjectOwnership, deleteProject } from '../services/project.service';
import { useProjectDetails } from '../hooks/useProjects';
import { Skeleton } from '../components/Skeleton';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import MemberSelect from '../components/MemberSelect';
import { Camera, Loader, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import MembersListModal from '../components/MembersListModal';
import { COLUMN_COLORS } from '../constants';
import { ProjectStatus, statusLabels, statusStyles } from '../types';
import ProjectDetailsScreenMobile from './ProjectDetailsScreenMobile';

const ProjectDetailsScreen = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <ProjectDetailsScreenMobile />;
    }

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { project, setProject, loading: loadingProject } = useProjectDetails(id!);
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

    const [pickingColorColumnId, setPickingColorColumnId] = useState<string | null>(null);

    // Inline card creation state (Trello-style)
    const [inlineCreatingColumnId, setInlineCreatingColumnId] = useState<string | null>(null);
    const [inlineTaskTitle, setInlineTaskTitle] = useState('');
    const [isCreatingInline, setIsCreatingInline] = useState(false);
    const inlineInputRef = useRef<HTMLTextAreaElement>(null);
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
    const [isOpenPointsMenuOpen, setIsOpenPointsMenuOpen] = useState(false);
    const [isCompletedPointsMenuOpen, setIsCompletedPointsMenuOpen] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const openPointsMenuRef = useRef<HTMLDivElement>(null);
    const completedPointsMenuRef = useRef<HTMLDivElement>(null);
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
            if (openPointsMenuRef.current && !openPointsMenuRef.current.contains(event.target as Node)) {
                setIsOpenPointsMenuOpen(false);
            }
            if (completedPointsMenuRef.current && !completedPointsMenuRef.current.contains(event.target as Node)) {
                setIsCompletedPointsMenuOpen(false);
            }
        };

        if (isFilterMenuOpen || isOpenPointsMenuOpen || isCompletedPointsMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen, isOpenPointsMenuOpen, isCompletedPointsMenuOpen]);

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

    const isLeader = user && (
        project?.leaderId === user.id ||
        project?.leader?.id === user.id
    );

    const isLeaderOrAdmin = isLeader || (user && user.role === 'ADMIN');

    const isProjectMember = user && project?.members?.some((m: any) => m.user?.id === user.id);

    // Task Details Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

    // Delete Confirmation State
    const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    // Leave Project Confirmation State
    const [isLeaveProjectModalOpen, setIsLeaveProjectModalOpen] = useState(false);

    // Transfer Leadership State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedNewLeaderId, setSelectedNewLeaderId] = useState<string>('');
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    // Project Deletion State
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

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

    // Inline card creation handlers
    const handleStartInlineCreate = (columnId: string) => {
        setInlineCreatingColumnId(columnId);
        setInlineTaskTitle('');
        // Focus the input after render
        setTimeout(() => {
            inlineInputRef.current?.focus();
        }, 50);
    };

    const handleInlineKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await submitInlineTask();
        } else if (e.key === 'Escape') {
            cancelInlineCreate();
        }
    };

    const handleInlineBlur = () => {
        // Only cancel if empty - do NOT auto-submit on blur
        // This prevents double submission when clicking the Add button
        setTimeout(() => {
            if (!inlineTaskTitle.trim() && !isCreatingInline) {
                cancelInlineCreate();
            }
        }, 200);
    };

    const submitInlineTask = async () => {
        if (!inlineTaskTitle.trim() || !inlineCreatingColumnId) return;
        if (isCreatingInline) return; // Prevent double submission

        setIsCreatingInline(true);
        try {
            await createQuickTask(id!, inlineCreatingColumnId, inlineTaskTitle.trim());
            window.dispatchEvent(new Event('pointsUpdated'));
            toast.success('Cartão criado!');
            setInlineCreatingColumnId(null);
            setInlineTaskTitle('');
            fetchKanban();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao criar cartão');
        } finally {
            setIsCreatingInline(false);
        }
    };

    const cancelInlineCreate = () => {
        setInlineCreatingColumnId(null);
        setInlineTaskTitle('');
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

    const handleDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            await deleteTask(taskToDelete);
            fetchKanban();
            toast.success("Tarefa excluída com sucesso!");
            window.dispatchEvent(new Event('pointsUpdated'));
        } catch (err: any) {
            console.error("Failed to delete task", err);
            toast.error(err.response?.data?.message || "Erro ao excluir tarefa");
        } finally {
            setTaskToDelete(null);
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
            // Disparar evento para atualizar pontos no menu lateral instantaneamente
            window.dispatchEvent(new Event('pointsUpdated'));
            // Optionally fetch to sync with server (e.g. for points, history, or reordering persistence)
            // fetchKanban(); 
        } catch (err: any) {
            console.error("Failed to move task", err);
            toast.error(err.response?.data?.message || "Erro ao mover tarefa");
            fetchKanban(); // Revert on failure
        }
    };

    const handleAddColumn = async () => {
        try {
            const defaultTitle = "Nova Coluna";
            // Create column with default title
            const newColumn = await createColumn(id!, defaultTitle, columns?.length || 0);

            // Refresh kanban to get the updated list including the new column
            await fetchKanban();

            // Enter edit mode for the new column
            setEditingColumnId(newColumn.id);
            setEditingTitle(defaultTitle);
        } catch (err: any) {
            console.error("Failed to create column", err);
            toast.error(err.response?.data?.message || "Erro ao criar coluna");
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
        } catch (err: any) {
            console.error("Failed to update column", err);
            toast.error(err.response?.data?.message || "Erro ao atualizar nome da coluna");
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
    const handleUpdateColumnColor = async (colorKey: string) => {
        if (!pickingColorColumnId) return;

        const newColumns = columns.map((col: any) =>
            col.id === pickingColorColumnId ? { ...col, color: colorKey } : col
        );
        setColumns(newColumns);

        const idToUpdate = pickingColorColumnId;
        setPickingColorColumnId(null);

        try {

            await updateColumn(idToUpdate, { color: colorKey });
            toast.success("Cor da coluna atualizada!");
        } catch (err: any) {
            console.error("Failed to update column color", err);
            toast.error(err.response?.data?.message || "Erro ao salvar cor");
            fetchKanban();
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
                    // Verificar se tem assignees (múltiplos) ou assignedTo (legado)
                    const hasAssignees = task.assignees && task.assignees.length > 0;
                    const isUnassigned = !hasAssignees && !task.assignedTo;
                    const matchesUnassigned = selectedMemberFilters.includes('unassigned') && isUnassigned;

                    // Verificar se algum dos assignees corresponde ao filtro
                    let matchesSpecific = false;
                    if (hasAssignees) {
                        matchesSpecific = task.assignees.some((a: any) => selectedMemberFilters.includes(a.user?.id));
                    } else if (task.assignedTo) {
                        matchesSpecific = selectedMemberFilters.includes(task.assignedTo.id);
                    }

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
    // Disable drag if ANY filter is active (member or search) or if user is not a member
    const isDragDisabled = selectedMemberFilters.length > 0 || !!searchQuery.trim() || !isProjectMember;

    const getColumnStyles = (column: any) => {
        const lowerTitle = column.title?.toLowerCase() || '';

        // Estilo especial verde para coluna de conclusão
        if (column.isCompletionColumn) {
            return {
                container: "bg-emerald-50/80 dark:bg-emerald-900/20 border-t-4 border-t-emerald-500 border-x border-b border-emerald-200/50 dark:border-emerald-800/50",
                headerIcon: <span className="material-icons text-emerald-500 text-sm">verified</span>,
                titleColor: "text-emerald-700 dark:text-emerald-300",
                badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
                isCompletionColumn: true
            };
        }
        if (column.color && COLUMN_COLORS[column.color as keyof typeof COLUMN_COLORS]) {
            const theme = COLUMN_COLORS[column.color as keyof typeof COLUMN_COLORS];
            return {
                container: `${theme.bg} ${theme.border} ${theme.decoration}`,
                headerIcon: <span className={`w-3 h-3 rounded-full ${theme.bg.replace('/80', '').replace('/10', '-400')}`}></span>, // Exemplo simples de icone
                titleColor: theme.text,
                badge: theme.badge
            };
        }
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
                keywords: ['concluido', 'conclusão', 'feito', 'done', 'finished'],
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
        if (!priority || priority === 'Geral') return null;
        return (
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {priority}
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

    const handleTransferLeadership = async (newId?: string) => {
        const idToTransfer = newId || selectedNewLeaderId;
        if (!idToTransfer) {
            toast.error('Selecione um membro para ser o novo líder.');
            return;
        }
        try {
            await transferProjectOwnership(id!, idToTransfer);
            toast.success('Liderança transferida com sucesso!');
            setIsTransferModalOpen(false);
            // Reload to reflect changes (permissions, etc)
            window.location.reload();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao transferir liderança.');
        }
    };

    const handleDeleteProject = async () => {
        setIsDeletingProject(true);
        try {
            await deleteProject(id!);
            toast.success('Projeto excluído com sucesso.');
            navigate('/projects');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao excluir projeto.');
        } finally {
            setIsDeletingProject(false);
            setIsDeleteProjectModalOpen(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col relative h-full">
            <div className="absolute inset-0 z-0 bg-network-pattern opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <div
                className={`bg-surface-light/80 dark:bg-secondary/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 transition-all duration-300 flex-shrink-0 relative group ${isHeaderMinimized ? 'pt-1 pb-1 px-3' : 'py-3 px-4'
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

                <div className="max-w-full mx-auto relative z-10">
                    <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center transition-all duration-300 ${isHeaderMinimized ? 'gap-1' : 'gap-3'
                        }`}>
                        <div className={`space-y-1 max-w-2xl transition-all duration-300 ${isHeaderMinimized ? 'hidden lg:block' : 'block'}`}>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span onClick={() => navigate('/projects')} className="hover:text-primary cursor-pointer">Projetos</span>
                                <span className="material-icons text-[10px]">chevron_right</span>
                                <span className="text-primary font-bold">Detalhes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className={`${isHeaderMinimized ? 'text-base truncate max-w-[200px]' : 'text-xl'} transition-all duration-300 font-display font-extrabold text-secondary dark:text-white lg:max-w-none`}>{project.title}</h1>
                                {!isHeaderMinimized && (
                                    isLeaderOrAdmin ? (
                                        <select
                                            value={project.status}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value as ProjectStatus;
                                                try {
                                                    await updateProject(id!, { status: newStatus });
                                                    setProject({ ...project, status: newStatus });
                                                    toast.success(`Status alterado para ${statusLabels[newStatus]}`);
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.message || 'Erro ao alterar status');
                                                }
                                            }}
                                            className={`${statusStyles[project.status as ProjectStatus] || 'bg-gray-100 text-gray-700'} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-current outline-none cursor-pointer focus:ring-1 focus:ring-primary h-6 text-center [text-align-last:center] flex items-center justify-center`}
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                            <option value="archived">Arquivado</option>
                                        </select>
                                    ) : (
                                        <span className={`${statusStyles[project.status as ProjectStatus] || 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-current inline-flex items-center justify-center min-w-[80px]`}>
                                            {statusLabels[project.status as ProjectStatus] || project.status}
                                        </span>
                                    )
                                )}
                                {project.type && !isHeaderMinimized && (
                                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-purple-200 dark:border-purple-800">
                                        {project.type}
                                    </span>
                                )}
                            </div>
                            {!isHeaderMinimized && (
                                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        <div className={`flex flex-col lg:flex-row items-end lg:items-center transition-all duration-300 ${isHeaderMinimized ? 'hidden lg:flex' : 'flex'
                            } gap-3`}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setIsMembersModalOpen(true)}
                                    title="Ver todos os membros"
                                >
                                    {project.members?.slice(0, 4).map((m: any, idx: number) => (
                                        <img
                                            key={idx}
                                            alt={m.user?.name || 'Member'}
                                            className="w-7 h-7 rounded-full border-2 border-white dark:border-secondary shadow-sm object-cover"
                                            src={m.user?.avatarUrl || `https://ui-avatars.com/api/?name=${m.user?.name || 'User'}&background=random`}
                                            title={m.user?.name}
                                        />
                                    ))}
                                    {project.members?.length > 4 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-secondary shadow-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                            +{project.members.length - 4}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-3 h-7">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                                        {project.leader?.avatarUrl ? (
                                            <img src={project.leader.avatarUrl} alt={project.leader.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-gray-500 font-bold text-[10px]">{project.leader?.name?.substring(0, 2).toUpperCase()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold leading-tight">Líder</p>
                                        <p className="text-[11px] font-bold text-secondary dark:text-white truncate max-w-[80px] lg:max-w-[100px] leading-tight">{project.leader?.name || "Desconhecido"}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Points Display - For all project members */}
                        {(user && (project?.leaderId === user.id || project?.leader?.id === user.id || project?.members?.some((m: any) => m.user?.id === user.id))) && (
                            <>
                                {/* Points per Open Task */}
                                {(user && (project?.leaderId === user.id || project?.leader?.id === user.id)) ? (
                                    <div className="relative" ref={openPointsMenuRef}>
                                        <button
                                            onClick={() => { setIsOpenPointsMenuOpen(!isOpenPointsMenuOpen); setIsCompletedPointsMenuOpen(false); }}
                                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <span>pontos por criar Task:</span>
                                            <span className="font-bold text-primary">{project?.pointsPerOpenTask || 50}</span>
                                            <span className="material-icons text-sm text-gray-400">expand_more</span>
                                        </button>
                                        {isOpenPointsMenuOpen && (
                                            <div className="absolute left-0 top-7 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                {[25, 50, 100, 200].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={async () => {
                                                            try {
                                                                await updateProject(id!, { pointsPerOpenTask: val });
                                                                setProject((prev: any) => ({ ...prev, pointsPerOpenTask: val }));
                                                                toast.success(`Criação: ${val}`);
                                                                setIsOpenPointsMenuOpen(false);
                                                            } catch (err) {
                                                                toast.error('Erro');
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-1 text-xs text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${(project?.pointsPerOpenTask || 50) === val ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
                                        <span>pontos por criar Task:</span>
                                        <span className="font-bold text-primary">{project?.pointsPerOpenTask || 50}</span>
                                    </div>
                                )}

                                {/* Points per Completed Task */}
                                {(user && (project?.leaderId === user.id || project?.leader?.id === user.id)) ? (
                                    <div className="relative" ref={completedPointsMenuRef}>
                                        <button
                                            onClick={() => { setIsCompletedPointsMenuOpen(!isCompletedPointsMenuOpen); setIsOpenPointsMenuOpen(false); }}
                                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <span>pontos por conclusão:</span>
                                            <span className="font-bold text-primary">{project?.pointsPerCompletedTask || 50}</span>
                                            <span className="material-icons text-sm text-gray-400">expand_more</span>
                                        </button>
                                        {isCompletedPointsMenuOpen && (
                                            <div className="absolute left-0 top-7 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                {[25, 50, 100, 200].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={async () => {
                                                            try {
                                                                await updateProject(id!, { pointsPerCompletedTask: val });
                                                                setProject((prev: any) => ({ ...prev, pointsPerCompletedTask: val }));
                                                                toast.success(`Conclusão: ${val}`);
                                                                setIsCompletedPointsMenuOpen(false);
                                                            } catch (err) {
                                                                toast.error('Erro');
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-1 text-xs text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${(project?.pointsPerCompletedTask || 50) === val ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
                                        <span>pontos por conclusão:</span>
                                        <span className="font-bold text-primary">{project?.pointsPerCompletedTask || 50}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Transfer Leadership - Only for Leader */}
                        {isLeader && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors cursor-pointer"
                                >
                                    <span className="material-icons text-sm">manage_accounts</span>
                                    <span>Transferir Liderança</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteProjectModalOpen(true)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir Projeto"
                                >
                                    <span className="material-icons text-sm">delete_forever</span>
                                    <span>Excluir</span>
                                </button>
                            </div>
                        )}

                        {/* Leave Project Button */}
                        {user && project?.members?.some((m: any) => m.user?.id === user.id) && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isLeader) {
                                        toast.error('Líderes de projeto não podem sair sem antes transferir a liderança.');
                                    } else {
                                        setIsLeaveProjectModalOpen(true);
                                    }
                                }}
                                title={isLeader ? "Líderes não podem sair sem transferir a liderança" : "Sair do Projeto"}
                                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer z-10 relative ${isLeader
                                    ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                            >
                                <span className="material-icons text-sm">logout</span>
                                <span>Sair do Projeto</span>
                            </button>
                        )}

                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="material-icons absolute left-2.5 top-1.5 text-gray-400 text-sm">search</span>
                            <input
                                className="pl-8 pr-3 py-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:ring-primary focus:border-primary w-48 dark:text-white dark:placeholder-gray-400 outline-none"
                                placeholder="Buscar tarefas..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative" ref={filterMenuRef}>
                            <button
                                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                className={`p-1.5 transition-all rounded-lg flex items-center gap-1 ${selectedMemberFilters.length > 0
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold'
                                    : 'text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-icons text-lg">filter_list</span>
                                {selectedMemberFilters.length > 0 && (
                                    <span className="text-[10px] bg-primary text-white px-1 py-0.5 rounded-full">
                                        {selectedMemberFilters.length}
                                    </span>
                                )}
                            </button>

                            {isFilterMenuOpen && (
                                <div className="absolute right-0 top-10 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 w-72 p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

                        {/* Alterar Capa - Apenas para líder/admin */}
                        {isLeaderOrAdmin && (
                            <label
                                className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-200 dark:border-gray-700 relative z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const input = e.currentTarget.querySelector('input');
                                    if (input && !uploadingCover) input.click();
                                }}
                            >
                                <input
                                    type="file"
                                    className="hidden absolute inset-0 opacity-0 w-0 h-0"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    disabled={uploadingCover}
                                />
                                {uploadingCover ? (
                                    <Loader className="animate-spin" size={14} />
                                ) : (
                                    <>
                                        <Camera size={14} />
                                        <span className="text-xs font-medium hidden sm:inline">Capa</span>
                                    </>
                                )}
                            </label>
                        )}

                        {/* Editar Projeto - Apenas para líder/admin */}
                        {isLeaderOrAdmin && (
                            <button
                                onClick={() => navigate(`/edit-project/${id}`)}
                                className="bg-primary hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-primary relative z-20"
                            >
                                <Edit size={14} />
                                <span className="text-xs font-medium hidden sm:inline">Editar</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Leaderless Warning Alert */}
                {(!project?.leaderId && !loadingProject) && (
                    <div className="mx-4 lg:mx-6 mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-pulse">
                        <span className="material-icons text-red-500">warning</span>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Projeto sem Líder</h4>
                            <p className="text-xs text-red-700 dark:text-red-400">Este projeto está atualmente sem um líder responsável. Algumas funções administrativas podem estar indisponíveis.</p>
                        </div>
                    </div>
                )}

                {/* Memberless Warning (if only 1 or 0 members and no leader) */}
                {(project?.members?.length <= 1 && !loadingProject) && (
                    <div className="mx-4 lg:mx-6 mt-4 p-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                        <span className="material-icons text-amber-500">info</span>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Projeto sem Membros</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400">Este projeto tem poucos ou nenhum membro. Convide colegas para começar a colaborar!</p>
                        </div>
                    </div>
                )}

                {/* Pull Handle (Mobile Only) */}
                <div className="lg:hidden flex justify-center mt-1 -mb-1">
                    <button
                        onClick={() => setIsHeaderMinimized(!isHeaderMinimized)}
                        className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-primary transition-colors relative"
                        title={isHeaderMinimized ? "Expandir" : "Recolher"}
                    >
                        <span className={`material-icons absolute -top-3 left-1/2 -translate-x-1/2 text-gray-400 text-xs transition-transform duration-300 ${isHeaderMinimized ? 'rotate-180' : ''}`}>
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
                                {/* columns list */}
                                {displayedColumns && displayedColumns.map((column: any, index: number) => {
                                    const styles = getColumnStyles(column);
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
                                                            {!column.isCompletionColumn && isProjectMember && (
                                                                <button
                                                                    onClick={() => startEditing(column.id, column.title)}
                                                                    className="p-1 text-gray-400 hover:text-blue-500"
                                                                    title="Renomear"
                                                                >
                                                                    <span className="material-icons text-sm">edit</span>
                                                                </button>
                                                            )}
                                                            {!column.isCompletionColumn && isProjectMember && (
                                                                <button
                                                                    onClick={() => handleDeleteColumn(column.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                    title="Excluir"
                                                                >
                                                                    <span className="material-icons text-sm">delete</span>
                                                                </button>
                                                            )}
                                                            {!column.isCompletionColumn && isProjectMember && (
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // Se já estiver aberto nesta coluna, fecha. Se não, abre.
                                                                            setPickingColorColumnId(pickingColorColumnId === column.id ? null : column.id);
                                                                        }}
                                                                        className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${pickingColorColumnId === column.id ? 'text-primary' : 'text-gray-400'}`}
                                                                        title="Trocar Cor"
                                                                    >
                                                                        <span className="material-icons text-sm">palette</span>
                                                                    </button>

                                                                    {/* Menu Flutuante de Cores */}
                                                                    {pickingColorColumnId === column.id && (
                                                                        <div className="absolute top-8 left-0 z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 w-32 animate-in fade-in zoom-in-95 duration-200 grid grid-cols-3 gap-2">
                                                                            {Object.entries(COLUMN_COLORS).map(([key, theme]) => (
                                                                                <button
                                                                                    key={key}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleUpdateColumnColor(key);
                                                                                    }}
                                                                                    className={`w-8 h-8 rounded-full border-2 ${theme.bg.split(' ')[0].replace(/-200\/.*/, '-500')} ${column.color === key ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent hover:scale-105'} transition-all shadow-sm`}
                                                                                    title={theme.name}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Overlay transparente para fechar ao clicar fora (opcional, mas recomendado) */}
                                                                    {pickingColorColumnId === column.id && (
                                                                        <div
                                                                            className="fixed inset-0 z-40 bg-transparent"
                                                                            onClick={(e) => { e.stopPropagation(); setPickingColorColumnId(null); }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <StrictModeDroppable droppableId={column.id} type="task" direction="vertical">
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
                                                                                className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 border-t-4 border-t-blue-500 cursor-grab hover:shadow-md hover:border-blue-500/50 group relative transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/40 z-50 scale-105' : ''
                                                                                    }`}
                                                                                style={{
                                                                                    ...provided.draggableProps.style,
                                                                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                                                }}
                                                                            >
                                                                                <div className="flex items-center gap-2 mb-2 justify-between">
                                                                                    {task.createdBy && (
                                                                                        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity" title={`Criado por: ${task.createdBy.name}`}>
                                                                                            <img
                                                                                                src={task.createdBy.avatarUrl || `https://ui-avatars.com/api/?name=${task.createdBy.name}&background=random`}
                                                                                                alt={task.createdBy.name}
                                                                                                className="w-4 h-4 rounded-full"
                                                                                            />
                                                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium hidden group-hover:block transition-all">Criado por: {task.createdBy.name}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex items-center gap-2">
                                                                                        {getPriorityBadge(task.priority)}
                                                                                    </div>
                                                                                </div>
                                                                                <h4 className={`font-bold text-secondary dark:text-gray-100 text-sm mb-3 ${column.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                                                                    {task.title}
                                                                                </h4>
                                                                                <div className="flex items-center justify-between mt-3">
                                                                                    <div className="flex items-center -space-x-2">
                                                                                        {/* Múltiplos responsáveis */}
                                                                                        {(task.assignees && task.assignees.length > 0) ? (
                                                                                            <>
                                                                                                {task.assignees.slice(0, 3).map((assignee: any, idx: number) => (
                                                                                                    <img
                                                                                                        key={idx}
                                                                                                        alt={assignee.user?.name}
                                                                                                        className={`w-6 h-6 rounded-full border border-white dark:border-surface-dark object-cover ${column.status === 'done' ? 'grayscale' : ''}`}
                                                                                                        src={assignee.user?.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.user?.name}&background=random`}
                                                                                                        title={assignee.user?.name}
                                                                                                    />
                                                                                                ))}
                                                                                                {task.assignees.length > 3 && (
                                                                                                    <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-[10px] font-bold border border-white dark:border-surface-dark">
                                                                                                        +{task.assignees.length - 3}
                                                                                                    </div>
                                                                                                )}
                                                                                            </>
                                                                                        ) : task.assignedTo ? (
                                                                                            <img
                                                                                                alt={task.assignedTo.name}
                                                                                                className={`w-6 h-6 rounded-full border border-white dark:border-surface-dark object-cover ${column.status === 'done' ? 'grayscale' : ''}`}
                                                                                                src={task.assignedTo.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignedTo.name}&background=random`}
                                                                                                title={task.assignedTo.name}
                                                                                            />
                                                                                        ) : (
                                                                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300 border border-white dark:border-surface-dark">?</div>
                                                                                        )}
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
                                                                {/* Skeleton Placeholder Animation */}
                                                                {provided.placeholder && React.isValidElement(provided.placeholder) ? (
                                                                    React.cloneElement(provided.placeholder as any, {
                                                                        className: "bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl animate-pulse opacity-80",
                                                                        style: {
                                                                            ...(provided.placeholder as any).props.style,
                                                                    React.cloneElement(provided.placeholder as React.ReactElement<any>, {
                                                                        className: "bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl animate-pulse opacity-80",
                                                                        style: {
                                                                            ...((provided.placeholder as React.ReactElement<any>).props.style || {}),
                                                                            visibility: 'visible',
                                                                        }
                                                                    })
                                                                ) : provided.placeholder}

                                                                {/* Inline card creation (Trello-style) */}
                                                                {inlineCreatingColumnId === column.id ? (
                                                                    <div className="bg-white dark:bg-surface-dark p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                                                        <textarea
                                                                            ref={inlineInputRef}
                                                                            value={inlineTaskTitle}
                                                                            onChange={(e) => setInlineTaskTitle(e.target.value)}
                                                                            onKeyDown={handleInlineKeyDown}
                                                                            onBlur={handleInlineBlur}
                                                                            placeholder="Digite o título da tarefa..."
                                                                            className="w-full p-2 text-sm bg-transparent border-0 focus:ring-0 resize-none rounded-lg placeholder:text-gray-400 dark:text-gray-100"
                                                                            rows={2}
                                                                            disabled={isCreatingInline}
                                                                        />
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <button
                                                                                onClick={submitInlineTask}
                                                                                disabled={!inlineTaskTitle.trim() || isCreatingInline}
                                                                                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                            >
                                                                                {isCreatingInline ? 'Criando...' : 'Adicionar'}
                                                                            </button>
                                                                            <button
                                                                                onClick={cancelInlineCreate}
                                                                                disabled={isCreatingInline}
                                                                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                                            >
                                                                                <span className="material-icons text-lg">close</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    isProjectMember && (
                                                                        <button
                                                                            onClick={() => handleStartInlineCreate(column.id)}
                                                                            className="w-full py-2 text-sm text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium border border-dashed border-gray-300 dark:border-gray-700"
                                                                        >
                                                                            <span className="material-icons text-sm">add</span> Adicionar cartão
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </StrictModeDroppable>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}

                                {/* Add Column Button - Only for members */}
                                {isProjectMember && (
                                    <div className="w-[320px] flex-shrink-0 flex items-start">
                                        <button
                                            onClick={handleAddColumn}
                                            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold"
                                        >
                                            <span className="material-icons">add</span>
                                            Nova Coluna
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            </div>
            {/* Modal para criação de nova tarefa (modo completo) */}
            <TaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => { setIsNewTaskModalOpen(false); }}
                projectId={id}
                initialColumnId={initialColumnId}
                projectMembers={project?.members}
                onSuccess={() => {
                    fetchKanban();
                    window.dispatchEvent(new Event('pointsUpdated'));
                }}
            />

            {/* Modal para visualização/edição de tarefa existente (estilo Trello) */}
            <TaskDetailModal
                isOpen={isTaskDetailsOpen}
                onClose={() => { setIsTaskDetailsOpen(false); setSelectedTask(null); }}
                onSuccess={() => {
                    fetchKanban();
                    window.dispatchEvent(new Event('pointsUpdated'));
                }}
                task={selectedTask}
                projectMembers={project?.members}
                columns={columns}
            />

            <ConfirmationModal
                isOpen={!!columnToDelete}
                onClose={() => setColumnToDelete(null)}
                onConfirm={confirmDeleteColumn}
                title="Excluir Coluna"
                message="Apenas colunas vazias podem ser removidas."
                confirmText="Sim, excluir"
                type="danger"
            />

            <ConfirmationModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={confirmDeleteTask}
                title="Excluir Tarefa"
                message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita e os pontos serão revogados."
                confirmText="Sim, excluir"
                type="danger"
            />

            <ConfirmationModal
                isOpen={isLeaveProjectModalOpen}
                onClose={() => setIsLeaveProjectModalOpen(false)}
                onConfirm={async () => {
                    try {
                        await leaveProject(id!);
                        toast.success('Você saiu do projeto com sucesso.');
                        navigate('/projects');
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Erro ao sair do projeto.');
                    }
                }}
                title="Sair do Projeto"
                message="Tem certeza que deseja sair deste projeto? Você perderá acesso às tarefas e não poderá contribuir até que seja adicionado novamente."
                confirmText="Sim, sair"
                cancelText="Cancelar"
                type="danger"
            />

            {/* Modal Transferência de Liderança */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                Transferir Liderança
                            </h2>
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl mb-6">
                            <div className="flex gap-3">
                                <span className="material-icons text-orange-500 shrink-0">warning</span>
                                <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                                    <strong>Atenção:</strong> Ao transferir a liderança, você perderá seus privilégios de administrador do projeto (como excluir o projeto ou transferir a liderança novamente). Esta ação é permanente.
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Selecione o novo líder
                            </label>
                            <MemberSelect
                                members={project?.members?.map((m: any) => m.user).filter((u: any) => u.id !== user?.id) || []}
                                selectedId={selectedNewLeaderId}
                                onChange={(id) => setSelectedNewLeaderId(id)}
                                placeholder="Escolha um membro..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleTransferLeadership()}
                                disabled={!selectedNewLeaderId}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                Confirmar Transferência
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MembersListModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
                members={project?.members}
                leaderId={project?.leaderId || project?.leader?.id}
                currentUserId={user?.id}
                onTransfer={(newLeaderId) => {
                    handleTransferLeadership(newLeaderId);
                }}
            />

            <ConfirmationModal
                isOpen={isDeleteProjectModalOpen}
                onClose={() => setIsDeleteProjectModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Excluir Projeto"
                message={`Tem certeza que deseja excluir permanentemente o projeto "${project.title}"? Esta ação não pode ser desfeita e todos os dados relacionados (tarefas, comentários, etc.) serão perdidos.`}
                confirmText={isDeletingProject ? "Excluindo..." : "Excluir Permanentemente"}
                type="danger"
            />
        </div>
    );

};

export default ProjectDetailsScreen;