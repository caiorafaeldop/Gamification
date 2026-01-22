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
import { RichEditor, formatLink, textToHtmlWithImages } from './RichEditor';
import { MobileTaskDetailModal } from './MobileTaskDetailModal';
import { DesktopTaskDetailModal } from './DesktopTaskDetailModal';

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
      fetchComments();
    }
  }, [isOpen, task]);
  
  // Fechar dropdowns ao clicar fora - Moved specific refs logic to components, keeping global listeners minimal if needed or removing if generic.
  // Actually, handleColumnChange etc closes dropdowns. Components handle their own clicks outside for dropdowns now.
  
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
  
  const addAttachment = async (url: string) => {
    const updated = [...attachments, url];
    setAttachments(updated);
    await saveAttachments(updated);
  };
  
  const updateAttachment = async (index: number, value: string) => {
    const updated = [...attachments];
    updated[index] = value;
    setAttachments(updated);
    await saveAttachments(updated);
  };
  
  const deleteAttachment = async (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
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
      <MobileTaskDetailModal
        onClose={onClose}
        title={title} setTitle={setTitle} handleTitleBlur={handleTitleBlur}
        description={description} setDescription={setDescription} handleDescriptionBlur={handleDescriptionBlur} handleImageUpload={handleImageUpload}
        currentColumn={currentColumn} columns={columns} selectedColumnId={selectedColumnId} setShowColumnDropdown={setShowColumnDropdown} showColumnDropdown={showColumnDropdown} handleColumnChange={handleColumnChange}
        showQuickActions={showQuickActions} setShowQuickActions={setShowQuickActions}
        showDescription={showDescription} setShowDescription={setShowDescription}
        assignees={assignees} toggleAssignee={toggleAssignee} showMemberPicker={showMemberPicker} setShowMemberPicker={setShowMemberPicker}
        projectMembers={projectMembers} activeAddGroup={activeAddGroup} setActiveAddGroup={setActiveAddGroup}
        dueDate={dueDate} handleDateChange={handleDateChange}
        durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes} handleDurationChange={handleDurationChange}
        attachments={attachments} deleteAttachment={deleteAttachment}
        comments={comments} handleDeleteComment={handleDeleteComment}
        newComment={newComment} setNewComment={setNewComment} handleSendComment={handleSendComment} sendingComment={sendingComment}
      />
    );
  }

  return (
    <DesktopTaskDetailModal
      onClose={onClose}
      title={title} setTitle={setTitle} handleTitleBlur={handleTitleBlur} isEditingTitle={isEditingTitle} setIsEditingTitle={setIsEditingTitle}
      description={description} setDescription={setDescription} handleDescriptionBlur={handleDescriptionBlur} isEditingDescription={isEditingDescription} setIsEditingDescription={setIsEditingDescription} handleImageUpload={handleImageUpload} uploadingImage={uploadingImage}
      currentColumn={currentColumn} columns={columns} selectedColumnId={selectedColumnId} handleColumnChange={handleColumnChange} showColumnDropdown={showColumnDropdown} setShowColumnDropdown={setShowColumnDropdown}
      assignees={assignees} toggleAssignee={toggleAssignee} showMemberPicker={showMemberPicker} setShowMemberPicker={setShowMemberPicker} projectMembers={projectMembers} activeAddGroup={activeAddGroup} setActiveAddGroup={setActiveAddGroup}
      startDate={startDate} dueDate={dueDate} handleDateChange={handleDateChange}
      durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes} handleDurationChange={handleDurationChange}
      attachments={attachments} addAttachment={addAttachment} updateAttachment={updateAttachment} deleteAttachment={deleteAttachment}
      comments={comments} loadingComments={loadingComments} newComment={newComment} setNewComment={setNewComment} handleSendComment={handleSendComment} sendingComment={sendingComment} handleDeleteComment={handleDeleteComment}
      saving={saving}
    />
  );
};

export default TaskDetailModal;
