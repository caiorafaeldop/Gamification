import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Kanban as KanbanIcon, MoreVertical, UserCircle2, Clock, Check } from 'lucide-react';
import { KANBAN_TASKS } from '../constants';
import { Task } from '../types';

const ProjectDetailsScreen = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(KANBAN_TASKS);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const onDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const onDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId) {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId ? { ...task, status: status } : task
        )
      );
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: Task['status']) => tasks.filter(task => task.status === status);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-surface-light/80 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 p-4 sm:p-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white">Plataforma Connecta 2.0</h1>
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">Ativo</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <button onClick={() => navigate('/new-task')} className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
              <Plus size={16} /> Nova Tarefa
            </button>
            <button onClick={() => navigate('/kanban')} className="px-4 py-2.5 bg-white dark:bg-surface-darker text-primary font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
              <KanbanIcon size={16} /> Quadro Completo
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6">
        <div className="h-full flex gap-6 min-w-[1000px] lg:min-w-0">
          
          {/* Column: Backlog */}
          <div 
            onDragOver={(e) => onDragOver(e, 'todo')}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 'todo')}
            className={`flex-1 flex flex-col min-w-[320px] rounded-2xl border backdrop-blur-sm transition-colors duration-200
                ${dragOverColumn === 'todo' ? 'bg-gray-100 dark:bg-surface-dark/60 border-primary/50' : 'bg-gray-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50'}
            `}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-display font-bold text-gray-700 dark:text-gray-200">Backlog</h3>
              <span className="text-xs font-bold text-gray-400">{getTasksByStatus('todo').length}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {getTasksByStatus('todo').map(task => (
                <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-secondary dark:text-gray-100 text-sm">{task.title}</h4>
                    <button className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16}/></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <UserCircle2 size={18} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Mariana C.</span>
                    </div>
                  </div>
                </div>
              ))}
               {getTasksByStatus('todo').length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wide">
                      Arraste aqui
                  </div>
              )}
            </div>
          </div>

          {/* Column: In Progress */}
          <div 
            onDragOver={(e) => onDragOver(e, 'in-progress')}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 'in-progress')}
            className={`flex-1 flex flex-col min-w-[320px] rounded-2xl border-t-4 transition-colors duration-200
                ${dragOverColumn === 'in-progress' 
                    ? 'bg-primary/10 border-t-primary border-primary/50' 
                    : 'bg-primary/5 dark:bg-surface-dark/60 border-t-primary border-x border-b border-gray-200/50 dark:border-gray-800/50'}
             `}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-display font-bold text-gray-700 dark:text-gray-200">Em andamento</h3>
              <span className="text-xs font-bold text-gray-400">{getTasksByStatus('in-progress').length}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {getTasksByStatus('in-progress').map(task => (
                <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg shadow-primary/5 border border-primary/20 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-secondary dark:text-gray-100 text-sm">{task.title}</h4>
                    <button className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16}/></button>
                  </div>
                   <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <UserCircle2 size={18} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Carlos M.</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded text-[10px] font-bold">
                        <Clock size={12} />
                        <span>2d</span>
                    </div>
                  </div>
                </div>
              ))}
              {getTasksByStatus('in-progress').length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wide">
                      Arraste aqui
                  </div>
              )}
            </div>
          </div>

           {/* Column: Done */}
           <div 
            onDragOver={(e) => onDragOver(e, 'done')}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 'done')}
            className={`flex-1 flex flex-col min-w-[320px] rounded-2xl border backdrop-blur-sm transition-colors duration-200
                ${dragOverColumn === 'done' ? 'bg-green-100 dark:bg-surface-dark/60 border-green-500/50' : 'bg-green-50/50 dark:bg-surface-dark/30 border-gray-200/50 dark:border-gray-800/50'}
             `}
           >
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-display font-bold text-gray-700 dark:text-gray-200">Concluído</h3>
              <span className="text-xs font-bold text-gray-400">{getTasksByStatus('done').length}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {getTasksByStatus('done').map(task => (
                <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    className={`bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-70 cursor-grab active:cursor-grabbing hover:opacity-100 transition-all group ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-secondary dark:text-gray-100 text-sm line-through decoration-2 decoration-green-500/30">{task.title}</h4>
                     <div className="text-green-500"><Check size={16} /></div>
                  </div>
                </div>
              ))}
              {getTasksByStatus('done').length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wide">
                      Arraste aqui
                  </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsScreen;