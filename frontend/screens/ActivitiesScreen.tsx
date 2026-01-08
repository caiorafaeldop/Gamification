import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, MapPin, Video, Kanban } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Skeleton } from '../components/Skeleton';

const AGENDA_EVENTS = [
  { id: 1, title: 'Reunião Geral de Alinhamento', type: 'meeting', date: '14 Out', time: '14:00 - 15:30', location: 'Google Meet', description: 'Atualização semanal de status de todos os projetos.' },
  { id: 2, title: 'Workshop: Flutter Avançado', type: 'workshop', date: '16 Out', time: '19:00 - 21:00', location: 'Auditório C', description: 'Aprenda técnicas avançadas de animação e gerenciamento de estado.' },
  { id: 3, title: 'Início do Hackathon 2024', type: 'event', date: '20 Out', time: '09:00', location: 'Centro de Tecnologia', description: 'Abertura oficial e formação de equipes.' },
];

const ActivitiesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
          Atividades & Agenda
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Acompanhe seus prazos iminentes e os próximos eventos da comunidade Connecta.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section: Deadlines */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg text-red-600 dark:text-red-400">
               <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-secondary dark:text-white">Perto do Prazo (Minhas Tarefas)</h2>
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
                    <p className="text-xs mt-2">Isso pode ocorrer se você não tiver tarefas ou se o endpoint /tasks/my-tasks ainda não estiver ativo.</p>
                </div>
            ) : deadlines.map((item: any) => (
              <div key={item.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.priority === 'HIGH' ? 'bg-red-500' : 
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
                  onClick={() => navigate('/kanban')}
                  className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-500 dark:text-gray-400 transition-all text-xs font-bold flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                >
                    <Kanban size={14} /> Ver Board
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Agenda Connecta */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
               <Calendar size={20} />
            </div>
            <h2 className="text-xl font-bold text-secondary dark:text-white">Agenda Connecta</h2>
          </div>

          <div className="space-y-4">
             {/* Mock loading for agenda if it came from API, but keeping it consistent with skeletons if we were waiting */}
             {loading && AGENDA_EVENTS.length === 0 ? ( // Logic to show skeleton if agenda was dynamic
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
             ) : (
                AGENDA_EVENTS.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-primary/30 transition-colors">
                     <div className="flex gap-4">
                         {/* Date Box */}
                         <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
                             <span className="text-xs font-bold text-gray-400 uppercase">{event.date.split(' ')[1]}</span>
                             <span className="text-xl font-black text-secondary dark:text-white">{event.date.split(' ')[0]}</span>
                         </div>
 
                         <div className="flex-1">
                             <div className="flex justify-between items-start">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-2 inline-block ${
                                     event.type === 'meeting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                     event.type === 'workshop' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                 }`}>
                                     {event.type === 'meeting' ? 'Reunião' : event.type === 'workshop' ? 'Workshop' : 'Evento'}
                                 </span>
                             </div>
                             
                             <h4 className="font-bold text-secondary dark:text-white mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{event.description}</p>
                             
                             <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                 <div className="flex items-center gap-1">
                                     <Clock size={12} /> {event.time}
                                 </div>
                                 <div className="flex items-center gap-1">
                                     {event.location === 'Google Meet' ? <Video size={12} /> : <MapPin size={12} />}
                                     {event.location}
                                 </div>
                             </div>
                         </div>
                     </div>
                  </div>
              ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivitiesScreen;