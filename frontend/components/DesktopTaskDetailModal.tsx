import React, { useRef, useState, useEffect } from 'react';
import { X, Calendar, Clock, Paperclip, Users, Send, Trash2, Link, ChevronDown, Edit3, Check, ExternalLink, Plus, MoreVertical, GripVertical } from 'lucide-react';
import { RichEditor, formatLink, textToHtmlWithImages } from './RichEditor';

interface DesktopTaskDetailModalProps {
  onClose: () => void;
  title: string;
  setTitle: (value: string) => void;
  handleTitleBlur: () => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (value: boolean) => void;
  
  description: string;
  setDescription: (value: string) => void;
  handleDescriptionBlur: () => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (value: boolean) => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  uploadingImage: boolean;
  
  currentColumn: any;
  columns: any[];
  selectedColumnId: string;
  handleColumnChange: (id: string) => void;
  showColumnDropdown: boolean;
  setShowColumnDropdown: (value: boolean) => void;
  
  assignees: any[];
  toggleAssignee: (user: any, type: string) => void;
  showMemberPicker: boolean;
  setShowMemberPicker: (value: boolean) => void;
  projectMembers: any[];
  activeAddGroup: string | null;
  setActiveAddGroup: (value: string | null) => void;
  
  startDate: string;
  dueDate: string;
  handleDateChange: (field: 'startDate' | 'dueDate', value: string) => void;
  
  durationMinutes: number | '';
  setDurationMinutes: (value: number | '') => void;
  handleDurationChange: (value: number | '') => void;
  
  attachments: string[];
  addAttachment: (url: string) => void;
  updateAttachment: (index: number, url: string) => void;
  deleteAttachment: (index: number) => void;
  
  comments: any[];
  loadingComments: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  handleSendComment: () => void;
  sendingComment: boolean;
  handleDeleteComment: (commentId: string) => void;
  
  saving: boolean;
}

export const DesktopTaskDetailModal: React.FC<DesktopTaskDetailModalProps> = ({
  onClose,
  title, setTitle, handleTitleBlur, isEditingTitle, setIsEditingTitle,
  description, setDescription, handleDescriptionBlur, isEditingDescription, setIsEditingDescription, handleImageUpload, uploadingImage,
  currentColumn, columns, selectedColumnId, handleColumnChange, showColumnDropdown, setShowColumnDropdown,
  assignees, toggleAssignee, showMemberPicker, setShowMemberPicker, projectMembers, activeAddGroup, setActiveAddGroup,
  startDate, dueDate, handleDateChange,
  durationMinutes, setDurationMinutes, handleDurationChange,
  attachments, addAttachment, updateAttachment, deleteAttachment,
  comments, loadingComments, newComment, setNewComment, handleSendComment, sendingComment, handleDeleteComment,
  saving
}) => {
  // Desktop specific state
  const [leftColumnWidth, setLeftColumnWidth] = useState(60); 
  const [isResizing, setIsResizing] = useState(false);
  const [activeSection, setActiveSection] = useState<'dates' | 'duration' | null>(null);
  
  // Attachments UI state
  const [newAttachment, setNewAttachment] = useState('');
  const [editingAttachmentIndex, setEditingAttachmentIndex] = useState<number | null>(null);
  const [attachmentMenuIndex, setAttachmentMenuIndex] = useState<number | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const columnDropdownRef = useRef<HTMLDivElement>(null);
  const memberPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Helper
  const toggleSection = (section: 'dates' | 'duration') => {
    setActiveSection(prev => prev === section ? null : section);
  };
  
  const handleAddNewAttachment = () => {
    if (newAttachment.trim()) {
      addAttachment(newAttachment.trim());
      setNewAttachment('');
    }
  };

  const handleUpdateAttachment = (index: number, val: string) => {
    updateAttachment(index, val);
    setEditingAttachmentIndex(null);
  };
  
  const handleDeleteAttachment = (index: number) => {
    deleteAttachment(index);
    setAttachmentMenuIndex(null);
  };

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setLeftColumnWidth(Math.min(Math.max(newWidth, 30), 70)); 
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

  // Click outside handler
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
                            const val = e.target.value;
                            updateAttachment(index, val);
                        }}
                        onBlur={() => setEditingAttachmentIndex(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingAttachmentIndex(null)}
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
                              <button onClick={() => handleDeleteAttachment(index)} className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Deletar</button>
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
                    onBlur={() => handleAddNewAttachment()}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewAttachment()}
                    placeholder="Cole um link e pressione Enter..."
                    className="flex-1 text-xs bg-transparent outline-none dark:text-gray-100 placeholder:text-gray-400"
                  />
                  <button onClick={handleAddNewAttachment} disabled={!newAttachment.trim()} className="p-1 text-gray-400 hover:text-primary disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
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
