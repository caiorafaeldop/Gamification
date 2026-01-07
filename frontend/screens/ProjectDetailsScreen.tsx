import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreHorizontal, User, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../services/api';
import { deleteTask, getProjectKanban, updateTaskStatus } from '../services/task.service';
import { useProjectDetails } from '../hooks/useProjects';

const ProjectDetailsScreen = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { project, loading: loadingProject } = useProjectDetails(id!);
  const [columns, setColumns] = useState<any>(null);
  const [loadingKanban, setLoadingKanban] = useState(true);

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

  if (loadingProject || loadingKanban) return <div>Carregando...</div>;
  if (!project) return <div>Projeto não encontrado</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={() => navigate('/projects')} className="text-gray-500 hover:text-primary mb-2 flex items-center gap-1 text-sm font-bold">
            <ArrowLeft size={16} /> Voltar para Projetos
          </button>
          <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white flex items-center gap-3">
            {project.title}
            <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{project.status}</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mt-1">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {project.members?.map((m: any) => (
                 <div key={m.userId} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold" title={m.user?.name}>
                    {m.user?.avatarUrl ? <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full rounded-full" /> : <User size={16} />}
                 </div>
            ))}
            <button className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <Plus size={16} />
            </button>
          </div>
          <button 
            onClick={() => navigate('/new-task', { state: { projectId: id } })}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-sky-500 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
            {columns && Object.entries(columns).map(([columnId, tasks]: [string, any]) => (
                <div key={columnId} className="flex-shrink-0 w-80 flex flex-col bg-gray-50 dark:bg-surface-darker rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">{columnId.replace('_', ' ')}</h3>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
                    </div>
                    <Droppable droppableId={columnId}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex-1 space-y-3 min-h-[100px]"
                            >
                                {tasks.map((task: any, index: number) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-white dark:bg-surface-dark p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group relative"
                                            >
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-600`}>
                                                        Level {Math.ceil((task.difficulty || 1) / 3)}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-secondary dark:text-white mb-2">{task.title}</h4>
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                                                     <div className="flex items-center gap-2">
                                                        {task.assignedTo?.avatarColor ? (
                                                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: task.assignedTo.avatarColor }} title={task.assignedTo.name}></div>
                                                        ) : <User size={14} className="text-gray-400"/>}
                                                     </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            ))}
        </div>
      </DragDropContext>
    </div>
  );
};


export default ProjectDetailsScreen;