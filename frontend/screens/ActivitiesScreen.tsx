import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, MapPin, Video, Kanban, Plus, Users, UserCheck, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { getEvents, joinEvent, leaveEvent, deleteEvent, Event } from '../services/event.service';
import { Skeleton } from '../components/Skeleton';
import NewEventModal from '../components/NewEventModal';
import toast from 'react-hot-toast';

const ActivitiesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Estados para UI de Eventos
  const [expandedParticipants, setExpandedParticipants] = useState<string | null>(null);

  const toggleParticipantsList = (eventId: string) => {
    setExpandedParticipants(prev => prev === eventId ? null : eventId);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: string | null; eventTitle: string }>({
    show: false,
    eventId: null,
    eventTitle: ''
  });

  const openDeleteConfirm = (eventId: string, eventTitle: string) => {
    setDeleteConfirm({ show: true, eventId, eventTitle });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });
  };

  // Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const openNewEventModal = () => {
    setEditingEventId(null);
    setIsEventModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingEventId(id);
    setIsEventModalOpen(true);
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.warn("Could not fetch events", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setDeadlines(response.data);
      } catch (err) {
        console.warn("Could not fetch my-tasks, using fallback or empty", err);
        setDeadlines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
    loadEvents();
  }, []);

  const handleToggleParticipation = async (eventId: string, isParticipating: boolean) => {
    try {
      if (isParticipating) {
        await leaveEvent(eventId);
        toast.success('Participação cancelada.');
      } else {
        await joinEvent(eventId);
        toast.success('Participação confirmada! 🎉');
      }
      // Refresh events
      await loadEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar participação.');
    }
  };


  const handleDeleteEvent = async () => {
    if (!deleteConfirm.eventId) return;

    try {
      await deleteEvent(deleteConfirm.eventId);
      toast.success('Evento excluído com sucesso.');
      await loadEvents();
      closeDeleteConfirm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir evento.');
    }
  };


  return (
    <>
      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/30">
                <Trash2 className="text-white" size={28} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">
                Excluir Evento
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Tem certeza que deseja excluir o evento:
              </p>
              <p className="font-bold text-secondary dark:text-white mb-6">
                "{deleteConfirm.eventTitle}"
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Esta ação não pode ser desfeita.
              </p>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] transition-all"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
            Atividades & Agenda
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Acompanhe seus prazos iminentes e os próximos eventos da comunidade Famene.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Section: Deadlines (Integrated from DEV branch logic) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-secondary dark:text-white">Minhas Tarefas</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-28 rounded-xl" />
                  </div>
                ))
              ) : deadlines.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p>Nenhuma tarefa pendente encontrada.</p>
                </div>
              ) : deadlines.map((item: any) => (
                <div key={item.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.priority === 'HIGH' ? 'bg-red-500' :
                    item.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>

                  <div className="flex-1">
                    <h4 className="font-bold text-secondary dark:text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.project?.title || 'Projeto Desconhecido'}</p>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Sem data'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/project-details/${item.projectId}`)}
                    className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-500 dark:text-gray-400 transition-all text-xs font-bold flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                  >
                    <Kanban size={14} /> Ver Board
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Agenda Famene (Using Dynamic Events from HEAD) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Calendar size={20} />
              </div>
              <h2 className="text-xl font-bold text-secondary dark:text-white">Agenda Famene</h2>
            </div>

            <div className="space-y-4">
              {loadingEvents ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
              ) : events.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p>Nenhum evento agendado.</p>
                  <p className="text-xs mt-2">Clique no botão abaixo para criar o primeiro evento!</p>
                </div>
              ) : (
                events.map((event) => {
                  const eventDate = new Date(event.date);
                  const day = eventDate.getUTCDate();
                  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                  const isParticipating = event.participants?.some(p => p.userId === user?.id) || false;
                  const participantCount = event.participants?.length || 0;

                  return (
                    <div key={event.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-primary/30 transition-colors">
                      <div className="flex gap-4">
                        {/* Date Box */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-400 uppercase">{month}</span>
                          <span className="text-xl font-black text-secondary dark:text-white">{day}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-2 inline-block ${event.type === 'MEETING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              event.type === 'WORKSHOP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                              {event.type === 'MEETING' ? 'Reunião' : event.type === 'WORKSHOP' ? 'Workshop' : 'Evento'}
                            </span>
                          </div>

                          <h4 className="font-bold text-secondary dark:text-white mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{event.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock size={12} /> {event.time}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                {event.location.toLowerCase().includes('meet') || event.location.toLowerCase().includes('zoom') ? <Video size={12} /> : <MapPin size={12} />}
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users size={12} /> {participantCount} participante{participantCount !== 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Botão de participação */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleParticipation(event.id, isParticipating)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isParticipating
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                }`}
                            >
                              {isParticipating ? (
                                <>
                                  <UserCheck size={14} />
                                  Participando
                                </>
                              ) : (
                                <>
                                  <UserPlus size={14} />
                                  Participar
                                </>
                              )}
                            </button>
                          </div>


                          {/* Botões de editar e deletar - apenas para criador */}
                          {event.createdById === user?.id && (
                            <>
                              <div className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <button
                                  onClick={() => openEditModal(event.id)}
                                  className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary transition-all shadow-sm"
                                >
                                  <Edit2 size={12} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(event.id, event.title)}
                                  className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-all shadow-sm"
                                >
                                  <Trash2 size={12} />
                                  Excluir
                                </button>
                                <button
                                  onClick={() => toggleParticipantsList(event.id)}
                                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${expandedParticipants === event.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary'
                                    }`}
                                >
                                  <Users size={12} />
                                  Participantes
                                </button>
                              </div>

                              {/* Lista de Participantes Expandível */}
                              {expandedParticipants === event.id && (
                                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                                  <h5 className="text-sm font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                                    <Users size={14} className="text-primary" />
                                    Participantes ({participantCount})
                                  </h5>
                                  {participantCount === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Nenhum participante ainda.</p>
                                  ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {event.participants?.map((participant) => (
                                        <div
                                          key={participant.id}
                                          className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
                                        >
                                          {/* Avatar */}
                                          <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: participant.user.avatarColor || '#6366f1' }}
                                          >
                                            {participant.user.name?.charAt(0).toUpperCase() || '?'}
                                          </div>
                                          {/* Info */}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-secondary dark:text-white truncate">
                                              {participant.user.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                              Entrou em {new Date(participant.joinedAt).toLocaleDateString('pt-BR')}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Botão para criar novo evento */}
            <button
              onClick={openNewEventModal}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-sky-500 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ marginBottom: 'calc(env(safe-area-inset-bottom, 20px) + 32px)' }}
            >
              <Plus size={18} />
              Criar Novo Evento
            </button>
          </div>

        </div>
      </div>

      {/* New Event Modal */}
      <NewEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventId={editingEventId}
        onSuccess={loadEvents}
      />
    </>
  );
};

export default ActivitiesScreen;
