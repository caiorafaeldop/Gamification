import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Clock, Paperclip, Users, Send, Trash2, Link, ChevronDown, Edit3, Check, ExternalLink, Plus, MoreVertical, GripVertical, Image as ImageIcon, AlignLeft, Folder, CheckSquare, BarChart3, ChevronUp } from 'lucide-react';
import { updateTask } from '../services/task.service';
import { getComments, createComment, deleteComment } from '../services/comment.service';
import { uploadImage } from '../services/upload.service';
import toast from 'react-hot-toast';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: any;
  projectMembers?: any[];
  columns?: any[];
}

// Função para formatar link
const formatLink = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Função para converter texto com URLs de imagem para HTML
const textToHtmlWithImages = (text: string): string => {
  if (!text) return '';
  const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s]*)?)/gi;
  // Primeiro substituir imagens, depois converter quebras de linha para <br>
  let html = text.replace(imageRegex, '<img src="$1" alt="imagem" style="max-width:100%;max-height:200px;border-radius:8px;margin:4px 0;display:block;" />');
  // Converter \n para <br> para preservar quebras de linha
  html = html.replace(/\n/g, '<br>');
  return html;
};

// Função para converter HTML de volta para texto
const htmlToText = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Substituir imagens pelo URL
  div.querySelectorAll('img').forEach(img => {
    const textNode = document.createTextNode(img.src + '\n');
    img.replaceWith(textNode);
  });
  
  // Preservar quebras de linha: converter <br> e </div> para \n
  div.querySelectorAll('br').forEach(br => {
    br.replaceWith(document.createTextNode('\n'));
  });
  
  // Divs criam novas linhas no contenteditable
  div.querySelectorAll('div').forEach(d => {
    if (d.textContent) {
      const text = document.createTextNode('\n' + d.textContent);
      d.replaceWith(text);
    }
  });
  
  return div.textContent || div.innerText || '';
};

// Rich Editor com inserção na posição do cursor
const RichEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
  placeholder: string;
  className?: string;
  minHeight?: string;
}> = ({ value, onChange, onBlur, onImageUpload, placeholder, className = '', minHeight = '80px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused) {
      editorRef.current.innerHTML = textToHtmlWithImages(value);
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      const text = htmlToText(editorRef.current.innerHTML);
      onChange(text);
    }
  };

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = textToHtmlWithImages(value);
    }
    onBlur?.();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;
        
        // Inserir placeholder na posição atual
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        const placeholderSpan = document.createElement('span');
        placeholderSpan.textContent = '⏳ Enviando imagem...';
        placeholderSpan.style.color = '#3b82f6';
        placeholderSpan.style.fontStyle = 'italic';
        
        if (range) {
          range.deleteContents();
          range.insertNode(placeholderSpan);
          range.setStartAfter(placeholderSpan);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        // Upload e substituir placeholder
        const imageUrl = await onImageUpload(file);
        
        if (imageUrl && placeholderSpan.parentNode) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'imagem';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '200px';
          img.style.borderRadius = '8px';
          img.style.margin = '4px 0';
          img.style.display = 'block';
          
          placeholderSpan.replaceWith(img);
          
          // Atualizar o valor
          if (editorRef.current) {
            const text = htmlToText(editorRef.current.innerHTML);
            onChange(text);
          }
        } else if (placeholderSpan.parentNode) {
          placeholderSpan.textContent = '❌ Erro ao enviar';
          setTimeout(() => placeholderSpan.remove(), 2000);
        }
        
        break;
      }
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPaste={handlePaste}
      onKeyDown={(e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          if (range) {
            range.deleteContents();
            const tabNode = document.createTextNode('\t');
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode); 
            selection?.removeAllRanges();
            selection?.addRange(range);
            handleInput();
          }
        }
      }}
      data-placeholder={placeholder}
      className={`outline-none whitespace-pre-wrap ${className} ${!value ? 'empty-placeholder' : ''}`}
      style={{ minHeight }}
    />
  );
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  task,
  projectMembers = [],
  columns = [],
}) => {
  // Estados principais
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  
  // Campos Trello
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  
  // Múltiplos anexos
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [editingAttachmentIndex, setEditingAttachmentIndex] = useState<number | null>(null);
  const [attachmentMenuIndex, setAttachmentMenuIndex] = useState<number | null>(null);
  
  // Seções mutuamente exclusivas
  const [activeSection, setActiveSection] = useState<'dates' | 'duration' | null>(null);
  
  // Múltiplos responsáveis
  const [assignees, setAssignees] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [activeAddGroup, setActiveAddGroup] = useState<string | null>(null);
  
  // Comentários
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  
  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Resize das colunas
  const [leftColumnWidth, setLeftColumnWidth] = useState(60); // percentual
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const columnDropdownRef = useRef<HTMLDivElement>(null);
  const memberPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  
  // Mobile specific state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  // Carregar dados da task
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setSelectedColumnId(task.columnId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
      setStartDate(task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : '');
      setDurationMinutes(task.durationMinutes || '');
      
      if (task.attachmentUrl) {
        try {
          const parsed = JSON.parse(task.attachmentUrl);
          setAttachments(Array.isArray(parsed) ? parsed : [task.attachmentUrl]);
        } catch {
          setAttachments(task.attachmentUrl ? [task.attachmentUrl] : []);
        }
      } else {
        setAttachments([]);
      }
      
      setAssignees(
        task.assignees?.map((a: any) => ({
          user: a.user,
          type: a.type
        })) || 
        (task.assignedTo ? [{ user: task.assignedTo, type: null }] : [])
      );
      setActiveSection(null);
      fetchComments();
    }
  }, [isOpen, task]);
  
  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setLeftColumnWidth(Math.min(Math.max(newWidth, 30), 70)); // min 30%, max 70%
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);
  
  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target as Node)) {
        setShowColumnDropdown(false);
      }
      if (memberPickerRef.current && !memberPickerRef.current.contains(e.target as Node)) {
        setShowMemberPicker(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setAttachmentMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchComments = async () => {
    if (!task?.id) return;
    setLoadingComments(true);
    try {
      const data = await getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleSave = async (field: string, value: any) => {
    if (!task?.id) return;
    setSaving(true);
    try {
      const payload: any = { [field]: value };
      if (field === 'assignees') {
        // Enviar estrutura correta para o backend
        payload.assignees = value.map((a: any) => ({
          userId: a.user.id,
          type: a.type
        }));
        delete payload.assigneeIds;
      }
      await updateTask(task.id, payload);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };
  
  // Upload de imagem - retorna URL imediatamente
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const response = await uploadImage(file);
      toast.success('Imagem enviada!');
      return response.url;
    } catch {
      toast.error('Erro ao enviar imagem');
      return null;
    } finally {
      setUploadingImage(false);
    }
  }, []);
  
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== task.title) handleSave('title', title);
  };
  
  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (description !== task.description) handleSave('description', description);
  };
  
  const handleColumnChange = async (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowColumnDropdown(false);
    await handleSave('columnId', columnId);
  };
  
  const handleDateChange = async (field: 'startDate' | 'dueDate', value: string) => {
    if (field === 'startDate') setStartDate(value);
    else setDueDate(value);
    await handleSave(field, value ? new Date(value).toISOString() : null);
  };
  
  const handleDurationChange = async (value: number | '') => {
    setDurationMinutes(value);
    await handleSave('durationMinutes', value || null);
  };
  
  // Anexos
  const saveAttachments = async (newAttachments: string[]) => {
    const value = newAttachments.length > 0 ? JSON.stringify(newAttachments) : null;
    await handleSave('attachmentUrl', value);
  };
  
  const addAttachment = async () => {
    if (!newAttachment.trim()) return;
    const updated = [...attachments, newAttachment.trim()];
    setAttachments(updated);
    setNewAttachment('');
    await saveAttachments(updated);
  };
  
  const updateAttachment = async (index: number, value: string) => {
    const updated = [...attachments];
    updated[index] = value;
    setAttachments(updated);
    setEditingAttachmentIndex(null);
    await saveAttachments(updated);
  };
  
  const deleteAttachment = async (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    setAttachmentMenuIndex(null);
    await saveAttachments(updated);
  };
  
  const toggleAssignee = async (user: any, type: string ) => {
    // Check if user is assigned specifically as this type
    const isAssigned = assignees.some(a => a.user.id === user.id && a.type === type);
    
    const newAssignees = isAssigned 
      ? assignees.filter(a => !(a.user.id === user.id && a.type === type))
      : [...assignees, { user, type }];
    
    setAssignees(newAssignees);
    await handleSave('assignees', newAssignees);
  };
  

  const toggleSection = (section: 'dates' | 'duration') => {
    setActiveSection(prev => prev === section ? null : section);
  };
  
  const handleSendComment = async () => {
    if (!newComment.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      await createComment(task.id, newComment.trim());
      setNewComment('');
      fetchComments();
      toast.success('Comentário adicionado!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao enviar comentário');
    } finally {
      setSendingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comentário excluído!');
    } catch {
      toast.error('Erro ao excluir comentário');
    }
  };
  
  const currentColumn = columns.find(c => c.id === selectedColumnId);
  
  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[40] flex flex-col bg-gray-50 dark:bg-background-dark overflow-hidden pb-16">
        {/* Mobile Header */}
        <header className="sticky top-0 z-[45] bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex-1 flex justify-center">
             <div className="relative" ref={columnDropdownRef}>
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                {currentColumn?.title || 'Sem coluna'}
                <ChevronDown size={14} />
              </button>
              {showColumnDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden">
                  {columns.map((col: any) => (
                    <button
                      key={col.id}
                      onClick={() => handleColumnChange(col.id)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium border-b border-gray-100 dark:border-gray-700 last:border-0 ${col.id === selectedColumnId ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <MoreVertical size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-48 bg-white dark:bg-background-dark">
          
          {/* Title Input */}
          <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-start gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Título da tarefa..."
                className="flex-1 bg-transparent text-xl font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none leading-tight"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-b border-gray-100 dark:border-gray-800/50">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-full px-4 py-3 flex items-center justify-between text-gray-500"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Ações rápidas</span>
              {showQuickActions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showQuickActions && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${showDescription ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <AlignLeft size={16} /> Descrição
                </button>
                <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm">
                  <Paperclip size={16} /> Anexo
                </button>
                <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm">
                  <Users size={16} /> Membros
                </button>
                <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-sm">
                  <CheckSquare size={16} /> Checklist
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {showDescription && (
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800/50">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição</label>
              <RichEditor
                  value={description}
                  onChange={setDescription}
                  onBlur={handleDescriptionBlur}
                  onImageUpload={handleImageUpload}
                  placeholder="Adicionar detalhes..."
                  className="w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 border border-gray-200 dark:border-gray-800 focus:border-primary/50 text-sm min-h-[100px]"
                />
            </div>
          )}

          {/* Fields List */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {/* Responsável */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-4 mb-3">
                <Users size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Responsáveis</span>
                <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="ml-auto text-xs text-primary font-bold">
                  {showMemberPicker ? 'Pronto' : 'Editar'}
                </button>
              </div>
              
              <div className="ml-9 flex flex-wrap gap-2">
                {assignees.length === 0 && !showMemberPicker && (
                   <span className="text-sm text-gray-400 italic">Ninguém atribuído</span>
                )}
                {[
                  { type: 'CREATOR', label: 'Criação' },
                  { type: 'IMPLEMENTER', label: 'Implementação' },
                  { type: 'REVIEWER', label: 'Revisão' }
                ].map((group) => {
                  
                  const groupMembers = assignees.filter((a: any) => 
                    a.type === group.type || (!a.type && group.type === 'IMPLEMENTER')
                  );

                  if (groupMembers.length === 0 && !showMemberPicker) return null; // Only hide if not editing AND empty? Actually, we want to show 'Add' buttons potentially? 
                  
                  return (
                    <div key={group.type} className="w-full space-y-2 mb-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{group.label}</p>
                       <div className="flex flex-wrap gap-2">
                        
                        {/* Add Button with Dropdown */}
                        <div className="relative">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setActiveAddGroup(activeAddGroup === group.type ? null : group.type);
                             }}
                             className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-xs transition-colors ${activeAddGroup === group.type ? 'border-primary text-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:text-primary hover:border-primary'}`}
                           >
                             +
                           </button>
                           {activeAddGroup === group.type && (
                             <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px] max-h-[200px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                               {projectMembers.map((member: any) => {
                                 const user = member.user || member;
                                 const isAssigned = assignees.some((a: any) => a.user.id === user.id && a.type === group.type);
                                 return (
                                 <button 
                                     key={user.id} 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       toggleAssignee(user, group.type);
                                       setActiveAddGroup(null);
                                     }} 
                                     className={`w-full px-3 py-2 flex items-center gap-2 text-left text-xs border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-700 ${isAssigned ? 'bg-primary/10' : ''}`}
                                   >
                                     <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-6 h-6 rounded-full" />
                                     <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{user.name}</span>
                                     {isAssigned && <Check size={14} className="text-primary" />}
                                   </button>
                                 );
                               })}
                             </div>
                           )}
                        </div>
                        {groupMembers.map((assignee: any) => (
                          <div key={assignee.user.id} className="group flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 pr-3 rounded-full border border-gray-200 dark:border-gray-700">
                            
                            <img src={assignee.user.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.user.name}&background=random`} className="w-6 h-6 rounded-full" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{assignee.user.name}</span>
                            </div>
                            {showMemberPicker && (
                              <button onClick={() => toggleAssignee(assignee.user,assignee.type)} className="p-1 hover:text-red-400"><X size={12}/></button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              
            </div>

            {/* Datas */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Prazo</span>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDateChange('dueDate', e.target.value)}
                className="bg-transparent text-primary text-sm font-bold focus:outline-none text-right placeholder-gray-400"
              />
            </div>

             {/* Duração */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Duração (min)</span>
              </div>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                onBlur={() => handleDurationChange(durationMinutes)}
                placeholder="0"
                className="bg-transparent text-primary text-sm font-bold w-16 text-right focus:outline-none"
              />
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-4 mb-3">
                    <Paperclip size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Anexos ({attachments.length})</span>
                  </div>
                  <div className="ml-9 space-y-2">
                    {attachments.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                         <a href={formatLink(url)} target="_blank" className="text-xs text-blue-500 dark:text-blue-400 truncate flex-1 hover:underline">{url}</a>
                         <button onClick={() => deleteAttachment(i)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Comments Section (Mobile) */}
          <div className="px-4 pt-6 pb-2">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comentários</h3>
                <span className="text-xs text-gray-500">{comments.length}</span>
              </div>
              
              <div className="space-y-6">
                 {comments.length === 0 && <p className="text-center text-gray-400 text-xs py-4">Nenhum comentário ainda.</p>}
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name}`}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800"
                      alt=""
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.user?.name}</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={10}/></button>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl rounded-tl-none inline-block border border-gray-200 dark:border-gray-800" dangerouslySetInnerHTML={{ __html: textToHtmlWithImages(comment.content) }} />
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Bottom Bar - Positioned above the app's bottom navigation (h-16) */}
        <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3 z-[45]">
           <div className="flex-1 relative">
              <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white pl-4 pr-10 py-3 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none overflow-hidden placeholder:text-gray-500"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
              />
           </div>
           
           <button
              onClick={newComment ? handleSendComment : onClose}
              disabled={newComment ? false : false}
              className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full shadow-lg transition-all ${newComment 
                  ? 'bg-primary text-white shadow-primary/20 scale-100' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
           >
              {newComment ? <Send size={18} className="ml-0.5" /> : <Check size={20} />}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <style>{`
        .empty-placeholder:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
        .resize-handle {
          cursor: col-resize;
        }
        .resize-handle:hover {
          background: linear-gradient(to right, transparent 45%, #3b82f6 45%, #3b82f6 55%, transparent 55%);
        }
        /* Custom Scrollbar - Light Mode */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #64748b 0%, #475569 100%);
        }
        /* Custom Scrollbar - Dark Mode */
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #475569 0%, #334155 100%);
          border: 2px solid #1e293b;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #64748b 0%, #475569 100%);
        }
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #64748b #f1f5f9;
        }
        .dark .custom-scrollbar {
          scrollbar-color: #475569 #1e293b;
        }
      `}</style>
      
      <div 
        className="w-[95vw] max-w-7xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1">
            <div className="relative inline-block mb-2" ref={columnDropdownRef}>
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                na lista <span className="font-semibold">{currentColumn?.title || 'Sem coluna'}</span>
                <ChevronDown size={12} />
              </button>
              
              {showColumnDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                  {columns.map((col: any) => (
                    <button
                      key={col.id}
                      onClick={() => handleColumnChange(col.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${col.id === selectedColumnId ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="w-full text-xl font-bold bg-transparent border-b-2 border-primary outline-none dark:text-white"
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
                <Edit3 size={14} className="text-gray-400" />
              </h2>
            )}
          </div>
          
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setShowMemberPicker(!showMemberPicker)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${showMemberPicker ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Users size={12} /> Membros
          </button>
          <button onClick={() => toggleSection('dates')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${activeSection === 'dates' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Calendar size={12} /> Datas
          </button>
          <button onClick={() => toggleSection('duration')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${activeSection === 'duration' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Clock size={12} /> Duração
          </button>
        </div>
        
        {/* Main Content - Resizable Columns */}
        <div className="flex p-4" ref={containerRef}>
          {/* Left Column */}
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar" style={{ width: `${leftColumnWidth}%` }}>
            {/* Members */}
            {(showMemberPicker || assignees.length > 0) && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200" ref={memberPickerRef}>
                
                {/* Helper para renderizar grupo */}
                {[
                  { type: 'CREATOR', label: 'Criação' },
                  { type: 'IMPLEMENTER', label: 'Implementação' },
                  { type: 'REVIEWER', label: 'Revisão' }
                ].map(group => {
                   const membersOfType = assignees.filter(a => a.type === group.type || (!a.type && group.type === 'IMPLEMENTER'));
                   if (membersOfType.length === 0 && !showMemberPicker) return null;
                   
                   return (
                     <div key={group.type} className="flex flex-col gap-1">
                       {(membersOfType.length > 0 || showMemberPicker) && (
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{group.label}:</span>
                       )}
                       <div className="flex flex-wrap items-center gap-1">
                         {membersOfType.map(({ user, type }: any) => (
                           <div key={user.id} className="relative group" onClick={() => toggleAssignee(user,type)}>
                             <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-dark cursor-pointer hover:opacity-80" title={user.name} />
                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <X size={8} className="text-white" />
                             </span>
                           </div>
                         ))}
                         
                         {showMemberPicker && (
                           <div className="relative">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveAddGroup(activeAddGroup === group.type ? null : group.type);
                               }}
                               className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-xs transition-colors ${activeAddGroup === group.type ? 'border-primary text-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:text-primary hover:border-primary'}`}
                             >
                               +
                             </button>
                             {activeAddGroup === group.type && (
                               <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px] max-h-[150px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                 {projectMembers.map((member: any) => {
                                   const user = member.user || member;
                                   const isAssigned = assignees.some(a => a.user.id === user.id && a.type === group.type);
                                   return (
                                   <button 
                                       key={user.id} 
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         toggleAssignee(user, group.type);
                                         setActiveAddGroup(null); // Close after selection
                                       }} 
                                       className={`w-full px-2 py-1.5 flex items-center gap-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${isAssigned ? 'bg-primary/10' : ''}`}
                                     >
                                       <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-5 h-5 rounded-full" />
                                       <span className="flex-1 truncate">{user.name}</span>
                                       {isAssigned && <Check size={12} className="text-primary" />}
                                     </button>
                                   );
                                 })}
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   );
                })}
              </div>
            )}
            
            {/* Dates */}
            {activeSection === 'dates' && (
              <div className="h-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-xs text-gray-600 dark:text-gray-400">Início:</span>
                <input type="date" value={startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Prazo:</span>
                <input type="date" value={dueDate} onChange={(e) => handleDateChange('dueDate', e.target.value)} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
            )}
            
            {/* Duration */}
            {activeSection === 'duration' && (
              <div className="h-8 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-xs text-gray-600 dark:text-gray-400">Duração:</span>
                <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')} onBlur={() => handleDurationChange(durationMinutes)} placeholder="0" min="0" className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <span className="text-xs text-gray-600 dark:text-gray-400">min</span>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Descrição {uploadingImage && <span className="text-primary animate-pulse text-xs">Enviando...</span>}
              </h4>
              {isEditingDescription ? (
                <RichEditor
                  value={description}
                  onChange={setDescription}
                  onBlur={handleDescriptionBlur}
                  onImageUpload={handleImageUpload}
                  placeholder="Descrição... (Ctrl+V para imagens)"
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-100"
                  minHeight="100px"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingDescription(true)}
                  className={`min-h-[60px] p-3 text-sm rounded-lg cursor-pointer transition-colors border whitespace-pre-wrap ${description ? 'text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700' : 'text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  dangerouslySetInnerHTML={{ __html: description ? textToHtmlWithImages(description) : 'Descrição... (Ctrl+V para imagens)' }}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Paperclip size={12} /> Anexos ({attachments.length})
              </h4>
              
              <div className="space-y-2 p-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {attachments.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 group">
                    {editingAttachmentIndex === index ? (
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const updated = [...attachments];
                          updated[index] = e.target.value;
                          setAttachments(updated);
                        }}
                        onBlur={() => updateAttachment(index, attachments[index])}
                        onKeyDown={(e) => e.key === 'Enter' && updateAttachment(index, attachments[index])}
                        className="flex-1 px-2 py-1 text-xs border border-primary rounded bg-transparent dark:text-gray-100"
                        autoFocus
                      />
                    ) : (
                      <>
                        <ExternalLink size={12} className="text-blue-500 flex-shrink-0" />
                        <a href={formatLink(url)} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate">
                          {url}
                        </a>
                        <div className="relative" ref={attachmentMenuIndex === index ? attachmentMenuRef : null}>
                          <button onClick={() => setAttachmentMenuIndex(attachmentMenuIndex === index ? null : index)} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <MoreVertical size={14} />
                          </button>
                          {attachmentMenuIndex === index && (
                            <div className="absolute top-full right-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[100px]">
                              <button onClick={() => { setEditingAttachmentIndex(index); setAttachmentMenuIndex(null); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700">Editar</button>
                              <button onClick={() => deleteAttachment(index)} className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Deletar</button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Add new */}
                <div className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Link size={12} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    onBlur={() => newAttachment && addAttachment()}
                    onKeyDown={(e) => e.key === 'Enter' && addAttachment()}
                    placeholder="Cole um link e pressione Enter..."
                    className="flex-1 text-xs bg-transparent outline-none dark:text-gray-100 placeholder:text-gray-400"
                  />
                  <button onClick={addAttachment} disabled={!newAttachment.trim()} className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resize Handle */}
          <div 
            className="w-2 flex-shrink-0 resize-handle flex items-center justify-center cursor-col-resize hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
            onMouseDown={() => setIsResizing(true)}
          >
            <GripVertical size={12} className="text-gray-300" />
          </div>
          
          {/* Right Column - Comments */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pl-4 border-l border-gray-200 dark:border-gray-700 custom-scrollbar" style={{ width: `${100 - leftColumnWidth}%` }}>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-surface-dark py-1 z-10">
              Comentários ({comments.length})
            </h4>
            
            {/* New Comment */}
            <div className="space-y-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <RichEditor
                value={newComment}
                onChange={setNewComment}
                onImageUpload={handleImageUpload}
                placeholder="Comentário... (Ctrl+V para imagens)"
                className="w-full p-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-gray-100"
                minHeight="50px"
              />
              <button onClick={handleSendComment} disabled={!newComment.trim() || sendingComment} className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
                <Send size={12} /> {sendingComment ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            
            {/* Comments List */}
            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-center py-4 text-gray-400 text-xs">Carregando...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">Nenhum comentário.</div>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2 group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <img src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`} alt="User" className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">{comment.user?.name}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 break-words" dangerouslySetInnerHTML={{ __html: textToHtmlWithImages(comment.content) }} />
                      <button onClick={() => handleDeleteComment(comment.id)} className="mt-1 text-[10px] text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Trash2 size={10} /> Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {saving && (
          <div className="absolute top-2 right-16 px-2 py-1 bg-blue-500 text-white text-xs rounded animate-pulse">Salvando...</div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
