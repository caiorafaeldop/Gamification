import React, { useRef, useState } from 'react';
import { X, Calendar, Clock, Paperclip, Users, Send, Trash2, ChevronDown, Check, MoreVertical, AlignLeft, CheckSquare, ChevronUp } from 'lucide-react';
import { RichEditor, formatLink, textToHtmlWithImages } from './RichEditor';

interface MobileTaskDetailModalProps {
  onClose: () => void;
  // State from parent
  title: string;
  setTitle: (value: string) => void;
  handleTitleBlur: () => void;
  
  description: string;
  setDescription: (value: string) => void;
  handleDescriptionBlur: () => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  
  currentColumn: any;
  columns: any[];
  selectedColumnId: string;
  setShowColumnDropdown: (value: boolean) => void;
  showColumnDropdown: boolean;
  handleColumnChange: (id: string) => void;
  
  showQuickActions: boolean;
  setShowQuickActions: (value: boolean) => void;
  
  showDescription: boolean;
  setShowDescription: (value: boolean) => void;
  
  assignees: any[];
  toggleAssignee: (user: any, type: string) => void;
  showMemberPicker: boolean;
  setShowMemberPicker: (value: boolean) => void;
  projectMembers: any[];
  activeAddGroup: string | null;
  setActiveAddGroup: (value: string | null) => void;
  
  dueDate: string;
  handleDateChange: (field: 'startDate' | 'dueDate', value: string) => void;
  
  durationMinutes: number | '';
  setDurationMinutes: (value: number | '') => void;
  handleDurationChange: (value: number | '') => void;
  
  attachments: string[];
  deleteAttachment: (index: number) => void;
  
  comments: any[];
  handleDeleteComment: (commentId: string) => void;
  
  newComment: string;
  setNewComment: (value: string) => void;
  handleSendComment: () => void;
  sendingComment: boolean;
}

export const MobileTaskDetailModal: React.FC<MobileTaskDetailModalProps> = ({
  onClose,
  title, setTitle, handleTitleBlur,
  description, setDescription, handleDescriptionBlur, handleImageUpload,
  currentColumn, columns, selectedColumnId, setShowColumnDropdown, showColumnDropdown, handleColumnChange,
  showQuickActions, setShowQuickActions,
  showDescription, setShowDescription,
  assignees, toggleAssignee, showMemberPicker, setShowMemberPicker, projectMembers, activeAddGroup, setActiveAddGroup,
  dueDate, handleDateChange,
  durationMinutes, setDurationMinutes, handleDurationChange,
  attachments, deleteAttachment,
  comments, handleDeleteComment,
  newComment, setNewComment, handleSendComment, sendingComment
}) => {
  const columnDropdownRef = useRef<HTMLDivElement>(null);

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
        <div className="flex items-center gap-1 -mr-2">
            <button onClick={onClose} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <Check size={24} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MoreVertical size={24} />
            </button>
        </div>
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

                if (groupMembers.length === 0 && !showMemberPicker) return null; 
                
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
};
