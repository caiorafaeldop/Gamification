import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, AlignLeft, Folder, X, Check, Clock, Zap, BarChart3, Paperclip, Send, Trash2, Image as ImageIcon } from 'lucide-react';
import { createTask, updateTask, getTask } from '../services/task.service';
import { getComments, createComment, deleteComment } from '../services/comment.service';
import { uploadFile } from '../services/upload.service';
import { useProjects } from '../hooks/useProjects';
import { getAllUsers, getProfile } from '../services/user.service';
import MemberSelect from './MemberSelect';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: any; // Se passado, modo edição; se não, modo criação
  projectId?: string;
  initialColumnId?: string;
  projectMembers?: any[];
}

const TaskModal = ({ isOpen, onClose, onSuccess, task, projectId: defaultProjectId, initialColumnId, projectMembers }: TaskModalProps) => {
  const isEditMode = !!task;
  const { projects, loading: loadingProjects } = useProjects();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [taskLevel, setTaskLevel] = useState<'basic' | 'medium' | 'large'>('medium');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments State (only for edit mode)
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));

      if (projectMembers && projectMembers.length > 0) {
        setUsers(projectMembers.map(m => m.user || m));
      } else {
        fetchUsers();
      }

      if (isEditMode && task) {
        // Populate form with existing task data
        setTitle(task.title || '');
        setDescription(task.description || '');
        setProjectId(task.projectId || defaultProjectId || '');
        setAssignedToId(task.assignedTo?.id || task.assignedToId || '');
        setEstimatedTime(task.estimatedTimeMinutes ? String(task.estimatedTimeMinutes / 60) : '');
        setDeadline(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        
        // Map difficulty to level
        const diff = task.difficulty || 2;
        if (diff <= 1) setTaskLevel('basic');
        else if (diff <= 2) setTaskLevel('medium');
        else setTaskLevel('large');

        fetchComments();
      } else {
        resetForm();
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, task, isEditMode]);

  useEffect(() => {
    if (defaultProjectId && !isEditMode) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId, isEditMode]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const [usersData, me] = await Promise.all([getAllUsers(), getProfile()]);
      setUsers(usersData || []);
      setCurrentUser(me);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchComments = async () => {
    if (!task?.id) return;
    setLoadingComments(true);
    try {
      const data = await getComments(task.id);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const mapLevelToDifficulty = (level: string) => {
    switch (level) {
      case 'basic': return 1;
      case 'medium': return 2;
      case 'large': return 3;
      default: return 2;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);

    if (!title || (!projectId && !isEditMode)) {
      toast.error("Título e Projeto são obrigatórios.");
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        title,
        description,
        assignedToId: assignedToId || undefined,
        difficulty: mapLevelToDifficulty(taskLevel),
        estimatedTimeMinutes: estimatedTime ? parseFloat(estimatedTime) * 60 : undefined,
        dueDate: deadline ? new Date(deadline).toISOString() : undefined,
      };

      if (isEditMode) {
        await updateTask(task.id, payload);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        payload.projectId = projectId;
        payload.columnId = initialColumnId;
        payload.isExternalDemand = false;
        await createTask(payload);
        toast.success("Tarefa criada com sucesso!");
      }

      onSuccess();
      setTimeout(() => {
        resetForm();
      }, 300);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || (isEditMode ? "Erro ao atualizar tarefa." : "Erro ao criar tarefa."));
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
    setComments([]);
    setNewComment('');
  };

  // Comment Logic
  const handleSendComment = async () => {
    if (!newComment.trim() || !task?.id) return;

    setSendingComment(true);
    try {
      const comment = await createComment(task.id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar comentário.");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Excluir comentário?")) return;
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      toast.error("Erro ao excluir comentário");
    }
  };

  // Image Upload Logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'description' | 'comment') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      const markdownImage = `\n![Imagem](${url})\n`;

      if (target === 'description') {
        setDescription(prev => prev + markdownImage);
      } else {
        setNewComment(prev => prev + markdownImage);
      }
      toast.success("Imagem anexada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  // Helper to render text with markdown images
  const renderContentWithImages = (content: string) => {
    if (!content) return null;

    const parts = content.split(/(!\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
      const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const alt = imageMatch[1];
        const src = imageMatch[2];
        return (
          <img
            key={index}
            src={src}
            alt={alt}
            className="max-h-48 rounded-lg my-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:opacity-90 transition-opacity object-contain"
            onClick={() => window.open(src, '_blank')}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative bg-white dark:bg-surface-dark rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        <header className="flex-none bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-secondary dark:text-white">
              {isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode
                ? 'Edite os detalhes da tarefa'
                : (defaultProjectId ? 'Adicionando ao projeto atual' : 'Defina as atividades e metas para sua equipe.')}
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
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">

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
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlignLeft size={16} className="text-primary" /> Descrição e Requisitos
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Inserir Imagem"
                >
                  <ImageIcon size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'description')}
                />
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 resize-none"
                placeholder="Descreva o que precisa ser feito, critérios de aceitação e recursos necessários..."
              />
              {description && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Pré-visualização</div>
                  {renderContentWithImages(description)}
                </div>
              )}
              {uploading && <div className="text-xs text-primary animate-pulse mt-1">Enviando imagem...</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Select - Only show if NO default project and NOT edit mode */}
              {!defaultProjectId && !isEditMode && (
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
              <div className={(defaultProjectId || isEditMode) ? "md:col-span-2" : ""}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <User size={16} className="text-primary" /> Responsável
                </label>
                <MemberSelect
                  members={users}
                  selectedId={assignedToId}
                  onChange={setAssignedToId}
                  loading={loadingUsers}
                  placeholder={projectMembers ? 'Selecionar membro do projeto...' : 'Atribuir a...'}
                  allowUnassigned={true}
                  unassignedLabel="Sem responsável"
                />
              </div>
            </div>

            {/* Task Level & Points */}
            <div className="bg-sky-50 dark:bg-sky-900/10 rounded-xl p-4 border border-sky-100 dark:border-sky-900/30">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Nível da Tarefa
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { id: 'basic', label: 'Básica', pts: 50 },
                  { id: 'medium', label: 'Média', pts: 100 },
                  { id: 'large', label: 'Grande', pts: 200 }
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setTaskLevel(level.id as any)}
                    className={`relative overflow-hidden py-3 px-2 rounded-lg border-2 transition-all text-center ${taskLevel === level.id
                      ? 'border-primary bg-white dark:bg-surface-dark shadow-md'
                      : 'border-transparent bg-white/50 dark:bg-white/5 text-gray-500 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500 dark:text-gray-400">{level.label}</div>
                    <div className={`text-lg font-black ${taskLevel === level.id ? 'text-primary' : 'text-gray-400'}`}>
                      {level.pts} 🪙
                    </div>
                    {taskLevel === level.id && (
                      <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> Duração (h)
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
                  <Calendar size={16} className="text-primary" /> Prazo
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Comments Section - Only in Edit Mode */}
            {isEditMode && (
              <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  Comentários <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
                </h3>

                {/* Comment List */}
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {loadingComments ? (
                    <div className="text-center py-4 text-gray-400">Carregando comentários...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 dark:bg-background-dark rounded-xl text-gray-400">
                      Nenhum comentário ainda. Inicie a conversa.
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <div className="flex-shrink-0">
                          <img
                            src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`}
                            alt="User"
                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{comment.user?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {renderContentWithImages(comment.content)}
                          </div>

                          {(currentUser?.id === comment.userId) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="mt-1 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* New Comment Box */}
                <div className="flex gap-3 items-start">
                  <div className="flex-1 relative">
                    <div className="relative bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="w-full p-3 bg-transparent border-0 focus:ring-0 text-sm min-h-[60px] resize-none rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) handleSendComment();
                        }}
                      />
                      <div className="flex justify-between items-center p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10 rounded-b-xl">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => commentFileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Anexar imagem"
                          >
                            <Paperclip size={16} />
                          </button>
                          <input
                            type="file"
                            ref={commentFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'comment')}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendComment()}
                          disabled={!newComment.trim() || sendingComment}
                          className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {sendingComment ? "Enviando..." : "Comentar"} <Send size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 pl-1">Pressione Ctrl+Enter para enviar</p>
                  </div>
                </div>
              </div>
            )}
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
            {submitting ? <Clock size={20} className="animate-spin" /> : <Check size={20} />}
            {submitting ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar' : 'Criar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
