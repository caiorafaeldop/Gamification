import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, Zap, BarChart3, Clock, Paperclip, Send, Trash2, Image as ImageIcon, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { updateTask } from '../services/task.service';
import { getComments, createComment, deleteComment } from '../services/comment.service';
import { uploadFile } from '../services/upload.service';
import { getAllUsers, getProfile } from '../services/user.service';
import toast from 'react-hot-toast';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any; // Ideally Task interface
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [points, setPoints] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    
    // Comments State
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [sendingComment, setSendingComment] = useState(false);
    
    // Upload State
    const [uploading, setUploading] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const commentFileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load & Animation
    useEffect(() => {
        if (isOpen && task) {
            requestAnimationFrame(() => setIsVisible(true));
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority || 'medium');
            setAssignedToId(task.assignedTo?.id || '');
            setPoints(task.pointsReward || 0);
            setDifficulty(task.difficulty || 1);
            
            fetchMeta();
            fetchTaskComments();
        } else {
            setIsVisible(false);
        }
    }, [isOpen, task]);

    const fetchMeta = async () => {
        try {
            const [usersData, me] = await Promise.all([getAllUsers(), getProfile()]);
            setUsers(usersData || []);
            setCurrentUser(me);
        } catch (e) {
            console.error("Failed to fetch metadata", e);
        }
    };

    const fetchTaskComments = async () => {
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

    // Auto-save Fields on Blur (Optimistic UI would be better but simple safe updates for now)
    const handleUpdate = async (field: string, value: any) => {
        if (!task?.id) return;
        try {
            await updateTask(task.id, { [field]: value });
            // Ideally notify parent to refresh, but local state update handles UI
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
            toast.error("Erro ao salvar alteração.");
        }
    };

    // Comment Logic
    const handleSendComment = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
                const newDesc = description + markdownImage;
                setDescription(newDesc);
                handleUpdate('description', newDesc);
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
        
        // Split by markdown image syntax: ![alt](url)
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
                        className="max-h-64 rounded-lg my-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:opacity-90 transition-opacity object-contain"
                        onClick={() => window.open(src, '_blank')}
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    if (!isOpen || !task) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            todo: "bg-gray-200 text-gray-700 hover:bg-gray-300",
            in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-200",
            done: "bg-green-100 text-green-700 hover:bg-green-200"
        };
        const labels = { todo: "A Fazer", in_progress: "Em Progresso", done: "Concluído" };
        const key = status as keyof typeof styles;
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase cursor-pointer transition-colors ${styles[key] || styles.todo}`}>
                {labels[key] || status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
             {/* Backdrop */}
             <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className={`relative bg-white dark:bg-[#1e1e1e] w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-[2rem] shadow-2xl flex flex-col sm:flex-row overflow-hidden transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
                
                {/* Close Button Mobile */}
                <button onClick={onClose} className="sm:hidden absolute top-4 right-4 p-2 text-gray-500 z-50">
                    <X size={24} />
                </button>

                {/* Left Column: Content (70%) */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1e1e1e]">
                    {/* Header: Title */}
                    <div className="p-6 sm:pl-8 sm:pr-4 sm:pt-8 border-b border-transparent">
                        <div className="flex items-start gap-4">
                            <div className={`mt-2 w-4 h-4 rounded-full flex-shrink-0 ${status === 'done' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <textarea
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => handleUpdate('title', title)}
                                rows={1}
                                className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-0 p-0 focus:ring-0 text-gray-900 dark:text-white resize-none placeholder-gray-400 leading-tight"
                                placeholder="Título da Tarefa"
                                style={{ fieldSizing: "content" } as any} // Future CSS prop, use auto-resize lib normally
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 pb-8">
                        {/* Description Section */}
                        <div className="mb-8 group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <AlignLeftIcon size={16} /> Descrição
                                </label>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Inserir Imagem na Descrição"
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
                            <div className="relative">
                                {/* Textarea and Preview Container */}
                                
                                {/* Textarea for Editing - Only visible when editing */}
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => { handleUpdate('description', description); setIsEditingDescription(false); }}
                                    onFocus={() => setIsEditingDescription(true)}
                                    className={`w-full p-4 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-[#252525] focus:bg-white dark:focus:bg-black/20 border-2 border-transparent focus:border-primary transition-all text-gray-700 dark:text-gray-300 resize-none leading-relaxed ${isEditingDescription ? 'min-h-[120px] mb-4' : 'hidden'}`}
                                    placeholder="Adicione uma descrição detalhada..."
                                />

                                {/* Rendered Content Display - Always visible as preview when editing, or main view when not editing */}
                                <div 
                                    onClick={() => setIsEditingDescription(true)}
                                    className={`w-full min-h-[100px] p-4 rounded-xl border-2 border-transparent transition-all text-gray-700 dark:text-gray-300 leading-relaxed 
                                        ${isEditingDescription 
                                            ? 'bg-gray-50/50 dark:bg-black/10 border-gray-100 dark:border-gray-800 opacity-80' // Preview mode style
                                            : 'hover:bg-gray-50 dark:hover:bg-[#252525] cursor-text' // View mode style
                                        }
                                        ${(!description && !isEditingDescription) ? 'italic text-gray-400' : ''}`}
                                >
                                    {isEditingDescription && <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">Pré-visualização (clique acima para editar)</div>}
                                    {description ? renderContentWithImages(description) : (!isEditingDescription && "Clique para adicionar uma descrição...")}
                                </div>

                                {uploading && <div className="absolute bottom-2 right-2 text-xs text-primary animate-pulse">Enviando imagem...</div>}
                            </div>

                        </div>

                        {/* Comments Section */}
                        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                Comentários <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
                            </h3>

                            {/* Comment List */}
                            <div className="space-y-6 mb-6">
                                {loadingComments ? (
                                    <div className="text-center py-4 text-gray-400">Carregando comentários...</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-[#252525] rounded-xl text-gray-400 mb-4">
                                        Nenhum comentário ainda. Inicie a conversa.
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
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
                                                
                                                {/* Actions (Delete only for owner - mocked check) */}
                                                {(currentUser?.id === comment.userId) && (
                                                    <button 
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="mt-2 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
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
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 hidden sm:block">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                        {currentUser?.name?.substring(0,2).toUpperCase() || "EU"}
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <div className="relative bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Escreva um comentário... (@ para mencionar, Markdown suportado)"
                                            className="w-full p-3 bg-transparent border-0 focus:ring-0 text-sm min-h-[80px] resize-y rounded-xl"
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && e.ctrlKey) handleSendComment();
                                            }}
                                        />
                                        <div className="flex justify-between items-center p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-black/10 rounded-b-xl">
                                            <div className="flex gap-1">
                                                <button 
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
                    </div>
                </div>

                {/* Right Column: Sidebar (30%) */}
                <div className="w-full sm:w-[350px] bg-gray-50 dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    
                    {/* Toolbar Actions */}
                    <div className="p-4 flex justify-end gap-2">
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-6 pb-6 space-y-8">
                        
                        {/* Status */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Estado</label>
                            <div className="space-y-2">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        handleUpdate('status', e.target.value);
                                    }}
                                    className="w-full p-2.5 rounded-lg bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                                >
                                    <option value="todo">A Fazer</option>
                                    <option value="in_progress">Em Progresso</option>
                                    <option value="done">Concluído</option>
                                </select>
                            </div>
                        </div>

                        {/* Assignee */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Responsável</label>
                             <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    value={assignedToId || ''}
                                    onChange={(e) => {
                                        setAssignedToId(e.target.value);
                                        handleUpdate('assignedToId', e.target.value);
                                    }}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="">Não atribuído</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Details Group */}
                        <div className="bg-white dark:bg-[#252525] rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><Zap size={12} /> Recompensa</label>
                                <div className="text-xl font-black text-secondary dark:text-white flex items-center gap-2">
                                    {points} <span className="text-xs font-bold text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">XP</span>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><BarChart3 size={12} /> Nível</label>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {difficulty <= 3 ? "Básico" : difficulty <= 6 ? "Intermediário" : "Avançado"}
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1"><Clock size={12} /> Est. Horas</label>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {task.estimatedTimeMinutes ? task.estimatedTimeMinutes / 60 : '-'}h
                                </div>
                            </div>
                        </div>

                        {/* Quick Dates */}
                         <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Prazo</label>
                             <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleUpdate('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                    </div>
                    
                    {/* Sidebar Footer */}
                    <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800">
                         <div className="text-xs text-center text-gray-400">
                            ID: {task.id.substring(0,8)} • Criado em {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper Icon Component if not available in lucide imports
const AlignLeftIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
);

export default TaskDetailsModal;
