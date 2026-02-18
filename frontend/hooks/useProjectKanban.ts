import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    getProjectKanban, updateTaskStatus, createColumn, updateColumn, 
    deleteColumn, reorderColumns, createQuickTask, deleteTask 
} from '../services/task.service';
import { getProfile } from '../services/user.service';
import { uploadProjectCover, updateProject, transferProjectOwnership } from '../services/project.service';
import { useProjectDetails } from '../hooks/useProjects';

export const useProjectKanban = (id: string) => {
    const navigate = useNavigate();
    const { project, setProject, loading: loadingProject, refetch: refetchProject } = useProjectDetails(id!);
    const [columns, setColumns] = useState<any>(null);
    const [loadingKanban, setLoadingKanban] = useState(true);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [user, setUser] = useState<any>(null);
    
    // Column Editing State
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    
    // Drag State
    const [isDragging, setIsDragging] = useState(false);

    // Color Picker State
    const [pickingColorColumnId, setPickingColorColumnId] = useState<string | null>(null);
    
    // Inline card creation state
    const [inlineCreatingColumnId, setInlineCreatingColumnId] = useState<string | null>(null);
    const [inlineTaskTitle, setInlineTaskTitle] = useState('');
    const [isCreatingInline, setIsCreatingInline] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMemberFilters, setSelectedMemberFilters] = useState<string[]>([]);
    
    // UI State
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
    
    // Modals
    const [isLeaveProjectModalOpen, setIsLeaveProjectModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedNewLeaderId, setSelectedNewLeaderId] = useState<string>('');
    
    // Task Detail State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

    const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [initialColumnId, setInitialColumnId] = useState<string | undefined>(undefined);

    // Refs
    const kanbanRef = useRef<HTMLDivElement>(null);

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

    const handleAddColumn = async () => {
        try {
            const defaultTitle = "Nova Coluna";
            const newColumn = await createColumn(id!, defaultTitle, columns?.length || 0);
            await fetchKanban();
            setEditingColumnId(newColumn.id);
            setEditingTitle(defaultTitle);
        } catch (err: any) {
            console.error("Failed to create column", err);
            toast.error(err.response?.data?.message || "Erro ao criar coluna");
        }
    };

    const handleSaveColumnTitle = async () => {
        if (!editingColumnId || !editingTitle.trim()) {
            if (!editingTitle.trim()) toast.error("O nome da coluna não pode ser vazio");
            return;
        }
        
        const newColumns = columns.map((col: any) =>
            col.id === editingColumnId ? { ...col, title: editingTitle } : col
        );
        setColumns(newColumns);
        
        const idToUpdate = editingColumnId;
        const titleToUpdate = editingTitle;
        setEditingColumnId(null);

        try {
            await updateColumn(idToUpdate, { title: titleToUpdate });
        } catch (err: any) {
            console.error("Failed to update column", err);
            toast.error(err.response?.data?.message || "Erro ao atualizar nome da coluna");
            fetchKanban();
        }
    };

    const handleDeleteColumn = (columnId: string) => setColumnToDelete(columnId);

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

    const handleDeleteTask = (taskId: string) => setTaskToDelete(taskId);

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

    const submitInlineTask = async () => {
        if (!inlineTaskTitle.trim() || !inlineCreatingColumnId || isCreatingInline) return;

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

    const onDragEnd = async (result: any) => {
        setIsDragging(false);
        if (!result.destination) return;
        const { source, destination, draggableId, type } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

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

        const sourceColIndex = columns.findIndex((c: any) => c.id === source.droppableId);
        const destColIndex = columns.findIndex((c: any) => c.id === destination.droppableId);

        if (sourceColIndex === -1 || destColIndex === -1) return;

        const newColumns = columns.map((col: any) => ({ ...col, tasks: [...col.tasks] }));
        const [movedTask] = newColumns[sourceColIndex].tasks.splice(source.index, 1);
        newColumns[destColIndex].tasks.splice(destination.index, 0, movedTask);

        setColumns(newColumns);

        try {
            await updateTaskStatus(draggableId, destination.droppableId);
            window.dispatchEvent(new Event('pointsUpdated'));
        } catch (err: any) {
            console.error("Failed to move task", err);
            toast.error(err.response?.data?.message || "Erro ao mover tarefa");
            fetchKanban();
        }
    };

    const handleMoveTask = async (taskId: string, targetColumnId: string) => {
        try {
            const newColumns = [...columns];
            let task: any = null;
            
            // Search for task in all columns
            for (const col of newColumns) {
                const tIndex = col.tasks.findIndex((t: any) => t.id === taskId);
                if (tIndex !== -1) {
                    task = col.tasks[tIndex];
                    col.tasks.splice(tIndex, 1);
                    break;
                }
            }

            if (task) {
                const targetCol = newColumns.find((c: any) => c.id === targetColumnId);
                if (targetCol) {
                    targetCol.tasks.push(task);
                    setColumns(newColumns);
                }
            }

            await updateTaskStatus(taskId, targetColumnId);
            window.dispatchEvent(new Event('pointsUpdated'));
            await fetchKanban(); 
            toast.success("Tarefa movida!");
        } catch (err: any) {
             console.error("Failed to move task", err);
            toast.error(err.response?.data?.message || "Erro ao mover tarefa");
            fetchKanban();
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
                window.location.reload(); 
                toast.success('Capa do projeto atualizada!');
            } catch (error) {
                console.error('Error upload:', error);
                toast.error('Erro ao fazer upload da imagem.');
            } finally {
                setUploadingCover(false);
            }
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

     const handleTransferLeadership = async () => {
        if (!selectedNewLeaderId) {
            toast.error('Selecione um membro para ser o novo líder.');
            return;
        }
        try {
            await transferProjectOwnership(id!, selectedNewLeaderId);
            toast.success('Liderança transferida com sucesso!');
            setIsTransferModalOpen(false);
            window.location.reload(); 
        } catch (err: any) {
             toast.error(err.response?.data?.message || 'Erro ao transferir liderança.');
        }
    };

    const getFilteredColumns = () => {
        if (!columns) return null;
        if (selectedMemberFilters.length === 0 && !searchQuery.trim()) return columns;
        return columns.map((col: any) => ({
            ...col,
            tasks: col.tasks.filter((task: any) => {
                let matchesMember = true;
                if (selectedMemberFilters.length > 0) {
                    const hasAssignees = task.assignees && task.assignees.length > 0;
                    const isUnassigned = !hasAssignees && !task.assignedTo;
                    const matchesUnassigned = selectedMemberFilters.includes('unassigned') && isUnassigned;
                    let matchesSpecific = false;
                    if (hasAssignees) {
                        matchesSpecific = task.assignees.some((a: any) => selectedMemberFilters.includes(a.user?.id));
                    } else if (task.assignedTo) {
                        matchesSpecific = selectedMemberFilters.includes(task.assignedTo.id);
                    }
                    matchesMember = matchesUnassigned || matchesSpecific;
                }
                let matchesSearch = true;
                if (searchQuery.trim()) {
                    matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return matchesMember && matchesSearch;
            })
        }));
    };

    return {
        project, loadingProject, loadingKanban, columns: getFilteredColumns(), user,
        isNewTaskModalOpen, setIsNewTaskModalOpen,
        uploadingCover, handleCoverUpload,
        editingColumnId, setEditingColumnId, editingTitle, setEditingTitle, handleSaveColumnTitle,
        pickingColorColumnId, setPickingColorColumnId, handleUpdateColumnColor,
        inlineCreatingColumnId, setInlineCreatingColumnId, inlineTaskTitle, setInlineTaskTitle, submitInlineTask, isCreatingInline,
        searchQuery, setSearchQuery, selectedMemberFilters, setSelectedMemberFilters,
        isHeaderMinimized, setIsHeaderMinimized,
        isLeaveProjectModalOpen, setIsLeaveProjectModalOpen,
        isTransferModalOpen, setIsTransferModalOpen, selectedNewLeaderId, setSelectedNewLeaderId, handleTransferLeadership,
        columnToDelete, handleDeleteColumn, confirmDeleteColumn, setColumnToDelete,
        taskToDelete, handleDeleteTask, confirmDeleteTask, setTaskToDelete,
        handleAddColumn, onDragEnd, isDragging, setIsDragging,
        initialColumnId, setInitialColumnId,
        selectedTask, setSelectedTask, isTaskDetailsOpen, setIsTaskDetailsOpen,
        refetchKanban: fetchKanban, kanbanRef, handleMoveTask,
        allColumns: columns // Export raw columns without filter for the move menu
    };
};
