import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, MapPin, Video, ArrowRight, Kanban } from 'lucide-react';

const ACTIVITIES_DEADLINES = [
  { id: 1, title: 'Entrega do Protótipo de Alta Fidelidade', project: 'Plataforma E-learning', deadline: 'Hoje, 23:59', urgency: 'high' },
  { id: 2, title: 'Revisão de Código do Backend', project: 'App de Monitoria', deadline: 'Amanhã, 14:00', urgency: 'medium' },
  { id: 3, title: 'Definição de Personas', project: 'Divulgação Hackathon', deadline: '15 Out, 18:00', urgency: 'low' },
];

const AGENDA_EVENTS = [
  { id: 1, title: 'Reunião Geral de Alinhamento', type: 'meeting', date: '14 Out', time: '14:00 - 15:30', location: 'Google Meet', description: 'Atualização semanal de status de todos os projetos.' },
  { id: 2, title: 'Workshop: Flutter Avançado', type: 'workshop', date: '16 Out', time: '19:00 - 21:00', location: 'Auditório C', description: 'Aprenda técnicas avançadas de animação e gerenciamento de estado.' },
  { id: 3, title: 'Início do Hackathon 2024', type: 'event', date: '20 Out', time: '09:00', location: 'Centro de Tecnologia', description: 'Abertura oficial e formação de equipes.' },
];

const ActivitiesScreen = () => {
  const navigate = useNavigate();

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
            <h2 className="text-xl font-bold text-secondary dark:text-white">Perto do Prazo</h2>
          </div>

          <div className="space-y-4">
            {ACTIVITIES_DEADLINES.map((item) => (
              <div key={item.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.urgency === 'high' ? 'bg-red-500' : 
                    item.urgency === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-secondary dark:text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.project}</p>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold">
                     <Clock size={14} className={
                         item.urgency === 'high' ? 'text-red-500' : 
                         item.urgency === 'medium' ? 'text-orange-500' : 'text-green-500'
                     } />
                     <span className={
                         item.urgency === 'high' ? 'text-red-600 dark:text-red-400' : 
                         item.urgency === 'medium' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                     }>{item.deadline}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/kanban')}
                  className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-500 dark:text-gray-400 transition-all text-xs font-bold flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                >
                    <Kanban size={14} /> Ir para Board <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
            
            {ACTIVITIES_DEADLINES.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    Nenhum prazo próximo! 🎉
                </div>
            )}
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
             {AGENDA_EVENTS.map((event) => (
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
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivitiesScreen;