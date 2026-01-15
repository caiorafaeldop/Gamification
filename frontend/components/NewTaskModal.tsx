import React, { useState, useEffect } from 'react';
import { Calendar, User, AlignLeft, Folder, X, Check, Clock, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { createTask } from '../services/task.service';
import { useProjects } from '../hooks/useProjects';
import { getAllUsers } from '../services/user.service';
import toast from 'react-hot-toast';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  initialColumnId?: string;
  projectMembers?: any[];
  onSuccess: () => void;
}

const NewTaskModal = ({ isOpen, onClose, projectId: defaultProjectId, initialColumnId, projectMembers, onSuccess }: NewTaskModalProps) => {
  const { projects, loading: loadingProjects } = useProjects();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [taskLevel, setTaskLevel] = useState<'basic' | 'medium' | 'large'>('medium');
  const [points, setPoints] = useState(150); // This is visual only, backend calculates real points
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow render before animating in
      requestAnimationFrame(() => setIsVisible(true));
      
      if (projectMembers && projectMembers.length > 0) {
          setUsers(projectMembers.map(m => m.user || m)); // Handles structure variations
      } else {
          fetchUsers();
      }
    } else {
        setIsVisible(false);
    }
  }, [isOpen, projectMembers]);

  useEffect(() => {
    if (defaultProjectId) {
        setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    switch (taskLevel) {
      case 'basic': setPoints(50); break;
      case 'medium': setPoints(150); break;
      case 'large': setPoints(300); break;
    }
  }, [taskLevel]);

  const mapLevelToDifficulty = (level: string) => {
      switch(level) {
          case 'basic': return 1;
          case 'medium': return 2;
          case 'large': return 3;
          default: return 2;
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!title || !projectId) {
        toast.error("Título e Projeto são obrigatórios.");
        setSubmitting(false);
        return;
    }

    try {
        const payload = {
            title,
            description,
            projectId,
            columnId: initialColumnId,
            assignedToId: assignedToId || undefined,
            difficulty: mapLevelToDifficulty(taskLevel),
            estimatedTimeMinutes: estimatedTime ? parseFloat(estimatedTime) * 60 : undefined,
            dueDate: deadline ? new Date(deadline).toISOString() : undefined,
            isExternalDemand: false 
        };

        await createTask(payload);
        toast.success("Tarefa criada com sucesso!");
        onSuccess();
        setTimeout(() => { // Small delay to clear state after animation
             resetForm();
        }, 300);
        onClose();
    } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Erro ao criar tarefa.");
    } finally {
        setSubmitting(false);
    }
  };

  const resetForm = () => {
      setTitle('');
      setDescription('');
      setAssignedToId('');
      setEstimatedTime('');
      setDeadline('');
      setTaskLevel('medium');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative bg-white dark:bg-surface-dark rounded-[2rem] w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        <header className="flex-none bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between z-10">
            <div>
                <h2 className="text-2xl font-display font-extrabold text-secondary dark:text-white">Nova Tarefa</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {defaultProjectId ? 'Adicionando ao projeto atual' : 'Defina as atividades e metas para sua equipe.'}
                </p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
                <X size={24} />
            </button>
        </header>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <form id="new-task-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Título da Tarefa
                    </label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                      placeholder="Ex: Implementar autenticação via Google"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                       <AlignLeft size={16} className="text-primary" /> Descrição e Requisitos
                    </label>
                    <textarea 
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 resize-none"
                      placeholder="Descreva o que precisa ser feito, critérios de aceitação e recursos necessários..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Select - Only show if NO default project */}
                    {!defaultProjectId && (
                        <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Folder size={16} className="text-primary" /> Projeto
                        </label>
                        {loadingProjects ? (
                            <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                        ) : (
                            <select 
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white cursor-pointer appearance-none"
                            >
                                <option value="" disabled>Selecione um projeto</option>
                                {projects.map((project: any) => (
                                <option key={project.id} value={project.id}>{project.title}</option>
                                ))}
                            </select>
                        )}
                        </div>
                    )}

                    {/* Assignee Select */}
                    <div className={defaultProjectId ? "md:col-span-2" : ""}> 
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <User size={16} className="text-primary" /> Responsável
                      </label>
                      {loadingUsers ? (
                        <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                      ) : (
                        <select 
                            value={assignedToId}
                            onChange={(e) => setAssignedToId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white cursor-pointer appearance-none"
                        >
                            <option value="">
                                {projectMembers ? 'Selecionar membro do projeto...' : 'Atribuir a...'}
                            </option>
                            {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name} {u.role ? `(${u.role})` : ''}</option>
                            ))}
                        </select>
                      )}
                    </div>
                </div>

                {/* Task Level & Points */}
                <div className="bg-sky-50 dark:bg-sky-900/10 rounded-xl p-4 border border-sky-100 dark:border-sky-900/30">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <BarChart3 size={16} className="text-primary" /> Nível da Tarefa
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { id: 'basic', label: 'Básica (lvl 1)', pts: 50 },
                        { id: 'medium', label: 'Média (lvl 2)', pts: 150 },
                        { id: 'large', label: 'Grande (lvl 3)', pts: 300 }
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setTaskLevel(level.id as any)}
                          className={`relative overflow-hidden py-3 px-2 rounded-lg border-2 transition-all text-center ${
                            taskLevel === level.id 
                              ? 'border-primary bg-white dark:bg-surface-dark shadow-md' 
                              : 'border-transparent bg-white/50 dark:bg-white/5 text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500 dark:text-gray-400">{level.label}</div>
                          <div className={`text-lg font-black ${taskLevel === level.id ? 'text-primary' : 'text-gray-400'}`}>
                            {level.pts} XP
                          </div>
                          {taskLevel === level.id && (
                            <div className="absolute top-0 right-0 p-1">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300 bg-white dark:bg-surface-dark p-3 rounded-lg border border-sky-100 dark:border-sky-800/50">
                       <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                       <span>Esta tarefa gerará aproximadamente <strong>{points} Connecta Points</strong> para o responsável.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Estimated Time */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Clock size={16} className="text-primary" /> Tempo Estimado (horas)
                      </label>
                      <input 
                        type="number" 
                        min="0.5"
                        step="0.5"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                        placeholder="Ex: 4"
                      />
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" /> Prazo de Entrega
                      </label>
                      <input 
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                      />
                    </div>
                </div>
            </form>
        </div>

        <div className="flex-none bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-6 flex items-center justify-end gap-4">
            <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                disabled={submitting}
            >
                Cancelar
            </button>
            <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? <Clock size={20} className="animate-spin"/> : <Check size={20} />} 
                {submitting ? 'Criando...' : 'Criar Tarefa'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
