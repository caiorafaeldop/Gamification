import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, AlertCircle, MapPin, Video, Kanban, Plus, Users, UserCheck, UserPlus, Edit2, Trash2, CheckSquare, CalendarDays } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/Skeleton';
import NewEventModal from '../components/NewEventModal';
import { PageHero, SectionHeader, SurfaceCard, EmptyState } from '../components/ui';
import { useActivities } from '../hooks/useActivities';

const ActivitiesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    events,
    deadlines,
    loadingEvents,
    loadingDeadlines,
    joinMutation,
    leaveMutation,
    deleteMutation,
  } = useActivities();
  const loading = loadingDeadlines;
  const queryClient = useQueryClient();
  const loadEvents = () => queryClient.invalidateQueries({ queryKey: ['events'] });

  const [expandedParticipants, setExpandedParticipants] = useState<string | null>(null);
  const toggleParticipantsList = (eventId: string) => {
    setExpandedParticipants((prev) => (prev === eventId ? null : eventId));
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: string | null; eventTitle: string }>({
    show: false,
    eventId: null,
    eventTitle: '',
  });
  const openDeleteConfirm = (eventId: string, eventTitle: string) => setDeleteConfirm({ show: true, eventId, eventTitle });
  const closeDeleteConfirm = () => setDeleteConfirm({ show: false, eventId: null, eventTitle: '' });

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

  const handleToggleParticipation = (eventId: string, isParticipating: boolean) => {
    if (isParticipating) leaveMutation.mutate(eventId);
    else joinMutation.mutate(eventId);
  };

  const handleDeleteEvent = () => {
    if (!deleteConfirm.eventId) return;
    deleteMutation.mutate(deleteConfirm.eventId, { onSuccess: () => closeDeleteConfirm() });
  };

  return (
    <>
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-surface-light p-6 shadow-2xl dark:bg-surface-dark animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
                <Trash2 className="text-white" size={28} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">Excluir Evento</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">Tem certeza que deseja excluir o evento:</p>
              <p className="mb-6 font-bold text-secondary dark:text-white">"{deleteConfirm.eventTitle}"</p>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] hover:shadow-red-500/50"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
        <PageHero
          icon={CalendarDays}
          tagLabel="Central de Atividades"
          title="Atividades & Agenda"
          description="Acompanhe seus prazos iminentes e os próximos eventos da comunidade Connecta."
          actionButtons={
            <button
              onClick={openNewEventModal}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-sky-500"
            >
              <Plus size={16} /> Novo Evento
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="space-y-6">
            <SectionHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle size={20} />
                </div>
              }
              title="Minhas Tarefas"
              description="Prazos que precisam da sua atenção."
              titleClassName="text-xl"
            />

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SurfaceCard key={i} padding="md" className="relative flex flex-col gap-4 overflow-hidden sm:flex-row">
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-xl" />
                  </SurfaceCard>
                ))
              ) : deadlines.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="Sem tarefas pendentes"
                  description="Você está em dia! Nenhuma tarefa aberta no momento."
                  compact
                />
              ) : deadlines.map((item: any) => (
                <SurfaceCard key={item.id} padding="md" className="group relative flex flex-col gap-4 overflow-hidden transition-shadow hover:shadow-md sm:flex-row sm:items-center">
                  <div
                    className={`absolute bottom-0 left-0 top-0 w-1 ${
                      item.priority === 'HIGH'
                        ? 'bg-red-500'
                        : item.priority === 'MEDIUM'
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="mb-1 font-bold text-secondary dark:text-white">{item.title}</h4>
                    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{item.project?.title || 'Projeto Desconhecido'}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Sem data'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/project-details/${item.projectId}`)}
                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-400"
                  >
                    <Kanban size={14} /> Ver Board
                  </button>
                </SurfaceCard>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeader
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar size={20} />
                </div>
              }
              title="Agenda Connecta"
              description="Próximos encontros, workshops e eventos da comunidade."
              titleClassName="text-xl"
            />

            <div className="space-y-4">
              {loadingEvents ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SurfaceCard key={i} padding="md" className="flex gap-4">
                    <Skeleton className="h-14 w-14 flex-shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </SurfaceCard>
                ))
              ) : events.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Nenhum evento agendado"
                  description="Crie o primeiro evento e convide a comunidade!"
                  action={
                    <button
                      onClick={openNewEventModal}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
                    >
                      <Plus size={16} /> Criar Evento
                    </button>
                  }
                />
              ) : (
                events.map((event) => {
                  const eventDate = new Date(event.date);
                  const day = eventDate.getUTCDate();
                  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                  const isParticipating = event.participants?.some((p) => p.userId === user?.id) || false;
                  const participantCount = event.participants?.length || 0;

                  return (
                    <SurfaceCard key={event.id} padding="md" className="group transition-colors hover:border-primary/30">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center dark:border-gray-700 dark:bg-background-dark">
                          <span className="text-xs font-bold uppercase text-gray-400">{month}</span>
                          <span className="text-xl font-black text-secondary dark:text-white">{day}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <span
                              className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                event.type === 'MEETING'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : event.type === 'WORKSHOP'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}
                            >
                              {event.type === 'MEETING' ? 'Reunião' : event.type === 'WORKSHOP' ? 'Workshop' : 'Evento'}
                            </span>
                          </div>
                          <h4 className="mb-1 font-bold text-secondary transition-colors group-hover:text-primary dark:text-white">{event.title}</h4>
                          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggleParticipation(event.id, isParticipating)}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                isParticipating
                                  ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-red-900/30 dark:hover:text-red-300'
                                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                              }`}
                            >
                              {isParticipating ? (<><UserCheck size={14} />Participando</>) : (<><UserPlus size={14} />Participar</>)}
                            </button>
                          </div>

                          {event.createdById === user?.id && (
                            <>
                              <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-gray-50 p-2 dark:bg-white/5">
                                <button
                                  onClick={() => openEditModal(event.id)}
                                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:text-primary dark:bg-gray-800 dark:text-gray-300"
                                >
                                  <Edit2 size={12} /> Editar
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(event.id, event.title)}
                                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:text-red-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                  <Trash2 size={12} /> Excluir
                                </button>
                                <button
                                  onClick={() => toggleParticipantsList(event.id)}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition-all ${
                                    expandedParticipants === event.id
                                      ? 'bg-primary text-white'
                                      : 'bg-white text-gray-600 hover:text-primary dark:bg-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  <Users size={12} /> Participantes
                                </button>
                              </div>

                              {expandedParticipants === event.id && (
                                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-background-dark animate-in slide-in-from-top-2 duration-200">
                                  <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-secondary dark:text-white">
                                    <Users size={14} className="text-primary" />
                                    Participantes ({participantCount})
                                  </h5>
                                  {participantCount === 0 ? (
                                    <p className="text-sm italic text-gray-400">Nenhum participante ainda.</p>
                                  ) : (
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                      {event.participants?.map((participant) => (
                                        <div
                                          key={participant.id}
                                          className="flex items-center gap-3 rounded-lg border border-gray-100 bg-surface-light p-2 dark:border-gray-800 dark:bg-surface-dark"
                                        >
                                          <div
                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: participant.user.avatarColor || '#6366f1' }}
                                          >
                                            {participant.user.name?.charAt(0).toUpperCase() || '?'}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-secondary dark:text-white">
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
                    </SurfaceCard>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

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
