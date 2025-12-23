import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, AlignLeft, Folder, ArrowLeft, Check, Clock, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { createTask } from '../services/task.service';
import { useProjects } from '../hooks/useProjects';
import { getAllUsers } from '../services/user.service';
import { useAuth } from '../hooks/useAuth';

const NewTaskScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [taskLevel, setTaskLevel] = useState<'basic' | 'medium' | 'large'>('medium');
  const [points, setPoints] = useState(150); // This is visual only, backend calculates real points
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Initialize projectId from location state if available
  const [projectId, setProjectId] = useState(location.state?.projectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchUsers();
  }, []);

  useEffect(() => {
    switch (taskLevel) {
      case 'basic': setPoints(50); break; // Visual cue
      case 'medium': setPoints(150); break;
      case 'large': setPoints(300); break;
    }
  }, [taskLevel]);

  const mapLevelToDifficulty = (level: string) => {
      switch(level) {
          case 'basic': return 3;
          case 'medium': return 6;
          case 'large': return 9;
          default: return 5;
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!title || !projectId) {
        setError("Título e Projeto são obrigatórios.");
        setSubmitting(false);
        return;
    }

    try {
        const payload = {
            title,
            description,
            projectId,
            assignedToId: assignedToId || undefined, // Send undefined if empty to avoid invalid UUID
            difficulty: mapLevelToDifficulty(taskLevel),
            estimatedTimeMinutes: estimatedTime ? parseInt(estimatedTime) * 60 : undefined, // hours to minutes
            dueDate: deadline ? new Date(deadline).toISOString() : undefined,
            isExternalDemand: false // Default
        };

        await createTask(payload);
        navigate('/project-details', { state: { projectId } }); // Navigate back to project details
    } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao criar tarefa. Verifique os dados.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary mb-6 transition-colors text-sm font-bold"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
              Nova Tarefa
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Defina as atividades e metas para sua equipe. Tarefas bem definidas geram mais engajamento.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
              
              {error && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                      {error}
                  </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span> Título da Tarefa
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                  placeholder="Ex: Implementar autenticação via Google"
                />
              </div>

              {/* Description Input */}
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
                {/* Project Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Folder size={16} className="text-primary" /> Projeto
                  </label>
                  <select 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Selecione um projeto</option>
                    {loadingProjects ? <option>Carregando...</option> : projects.map((project: any) => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={16} className="text-primary" /> Responsável
                  </label>
                  <select 
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white cursor-pointer appearance-none"
                  >
                    <option value="">Atribuir a...</option>
                    {loadingUsers ? <option>Carregando...</option> : users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Level & Points */}
              <div className="bg-sky-50 dark:bg-sky-900/10 rounded-xl p-4 border border-sky-100 dark:border-sky-900/30">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" /> Nível da Tarefa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { id: 'basic', label: 'Básica (Nível 1)', pts: 50 },
                    { id: 'medium', label: 'Média (Nível 2)', pts: 150 },
                    { id: 'large', label: 'Grande (Nível 3)', pts: 300 }
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
                        ~{level.pts} CP
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

            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Clock size={20} className="animate-spin"/> : <Check size={20} />} 
                {submitting ? 'Criando...' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="hidden lg:block w-80 space-y-6">
           <div className="bg-sky-50 dark:bg-sky-900/10 rounded-2xl p-6 border border-sky-100 dark:border-sky-900/30">
              <h3 className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2 mb-3">
                <AlertCircle size={18} /> Permissões
              </h3>
              <p className="text-sm text-sky-700 dark:text-sky-400 leading-relaxed mb-4">
                Como líder do projeto, você pode criar e atribuir tarefas. Membros só podem visualizar e solicitar atribuição.
              </p>
              <div className="h-px bg-sky-200 dark:bg-sky-800 my-4"></div>
              <p className="text-xs text-sky-600 dark:text-sky-500 font-semibold">
                Dica: Divida tarefas grandes (Nível 3) em tarefas menores para facilitar o acompanhamento no Kanban.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskScreen;