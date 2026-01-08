import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { deleteTask, getProjectKanban, updateTaskStatus } from '../services/task.service';
import { useProjectDetails } from '../hooks/useProjects';
import { Skeleton } from '../components/Skeleton';
import NewTaskModal from '../components/NewTaskModal';

const ProjectDetailsScreen = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { project, loading: loadingProject } = useProjectDetails(id!);
  const [columns, setColumns] = useState<any>(null);
  const [loadingKanban, setLoadingKanban] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

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

  const handleDeleteTask = async (taskId: string) => {
      if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
      try {
          await deleteTask(taskId);
          fetchKanban(); // Refresh
      } catch (err) {
          console.error("Failed to delete task", err);
          alert("Erro ao excluir tarefa");
      }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
        // Optimistic update
        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        const sourceItems = [...sourceCol];
        const destItems = [...destCol];
        const [removed] = sourceItems.splice(source.index, 1);
        removed.status = destination.droppableId; // Update status locally
        destItems.splice(destination.index, 0, removed);
        
        setColumns({
            ...columns,
            [source.droppableId]: sourceItems,
            [destination.droppableId]: destItems
        });

        // API Call
        try {
            await updateTaskStatus(draggableId, destination.droppableId);
        } catch (err) {
            console.error("Failed to move task", err);
            fetchKanban(); // Revert
        }
    }
  };

  const getColumnStyles = (columnId: string) => {
      switch (columnId.toLowerCase()) {
          case 'backlog':
          case 'todo':
              return {
                  container: "bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50",
                  headerIcon: <span className="w-3 h-3 rounded-full bg-slate-400"></span>,
                  titleColor: "text-gray-700 dark:text-gray-200",
                  badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              };
          case 'in_progress':
          case 'doing':
              return {
                  container: "bg-primary/5 dark:bg-surface-dark/60 border-t-4 border-t-primary border-x border-b border-gray-200/50 dark:border-gray-800/50",
                  headerIcon: <span className="material-icons text-primary animate-spin text-sm" style={{ animationDuration: '3s' }}>sync</span>,
                  titleColor: "text-gray-700 dark:text-gray-200",
                  badge: "bg-primary/20 text-primary"
              };
          case 'done':
          case 'completed':
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
                             {[1,2,3].map(i => <Skeleton key={i} width={40} height={40} variant="circular" className="border-2 border-white dark:border-secondary" />)}
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
                            <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white">{project.title}</h1>
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {project.description}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6">
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
                            <div className="border-l border-gray-300 dark:border-gray-700 h-8"></div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 uppercase font-bold">Líder do Projeto</p>
                                <p className="text-sm font-bold text-secondary dark:text-white">{project.leader?.name || "Desconhecido"}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsNewTaskModalOpen(true)}
                            className="bg-primary hover:bg-sky-400 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">add</span>
                            Nova Tarefa
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white dark:bg-surface-dark text-primary font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
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
                                className="pl-9 pr-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 dark:text-white dark:placeholder-gray-400 outline-none" 
                                placeholder="Buscar tarefas..." 
                                type="text"
                            />
                        </div>
                        <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                            <span className="material-icons">filter_list</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="h-full flex gap-6 min-w-[1000px] lg:min-w-0">
                    {columns && Object.entries(columns).map(([columnId, tasks]: [string, any]) => {
                        const styles = getColumnStyles(columnId);
                        return (
                            <div key={columnId} className={`flex-1 flex flex-col min-w-[320px] rounded-2xl border backdrop-blur-sm ${styles.container}`}>
                                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        {styles.headerIcon}
                                        <h3 className={`font-display font-bold ${styles.titleColor}`}>{columnId.replace('_', ' ').toUpperCase()}</h3>
                                        <span className={`${styles.badge} text-xs font-bold px-2 py-0.5 rounded-full`}>{tasks.length}</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <span className="material-icons text-lg">more_horiz</span>
                                    </button>
                                </div>
                                
                                <Droppable droppableId={columnId}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3"
                                        >
                                            {tasks.map((task: any, index: number) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab hover:shadow-md hover:border-primary/30 transition-all group relative"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {getPriorityBadge(task.priority)}
                                                            </div>
                                                            <h4 className={`font-bold text-secondary dark:text-gray-100 text-sm mb-3 ${columnId === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                                                {task.title}
                                                            </h4>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center -space-x-2">
                                                                    {task.assignedTo ? (
                                                                        <img 
                                                                            alt={task.assignedTo.name} 
                                                                            className={`w-6 h-6 rounded-full border border-white dark:border-surface-dark ${columnId === 'done' ? 'grayscale' : ''}`} 
                                                                            src={task.assignedTo.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignedTo.name}&background=random`} 
                                                                        />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300 border border-white dark:border-surface-dark">?</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                                                    {columnId === 'done' ? (
                                                                         <span className="text-gray-400">14 Out</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">chat_bubble_outline</span> 2</span>
                                                                            <span className="flex items-center gap-1 hover:text-primary"><span className="material-icons text-[14px]">attach_file</span> 1</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
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
                                                onClick={() => setIsNewTaskModalOpen(true)}
                                                className="w-full py-2 text-sm text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium border border-dashed border-gray-300 dark:border-gray-700"
                                            >
                                                <span className="material-icons text-sm">add</span> Adicionar cartão
                                            </button>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
      <NewTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)} 
        projectId={id}
        onSuccess={fetchKanban}
      />
    </div>
  );
};

export default ProjectDetailsScreen;