import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Award, Users, CheckCircle2, MessageSquare, ShieldCheck, User as UserIcon } from 'lucide-react';

const JoinProjectScreen = () => {
  const navigate = useNavigate();
  const [motivation, setMotivation] = useState('');

  // Mock data representing the project selected from the list
  const project = {
    title: "App de Monitoria",
    category: "Mobile Dev",
    description: "Criar um aplicativo mobile em Flutter para conectar alunos e monitores em tempo real. O objetivo é facilitar o agendamento de monitorias e o esclarecimento de dúvidas rápidas dentro da universidade.",
    objectives: [
      "Desenvolver interface responsiva em Flutter",
      "Integrar com API de calendário da universidade",
      "Implementar chat em tempo real (WebSockets)",
      "Sistema de avaliação de monitores"
    ],
    leader: {
      name: "Prof. Roberto Santos",
      role: "Orientador",
      department: "Departamento de Computação"
    },
    reward: 1200,
    members: [
      { id: 1, name: "Ana Clara" },
      { id: 2, name: "Pedro H." }
    ],
    maxMembers: 5,
    color: "bg-blue-600"
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    navigate('/projects');
    // In a real app, show a toast success message
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary mb-6 transition-colors text-sm font-bold"
      >
        <ArrowLeft size={16} /> Voltar para Projetos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             
             <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {project.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <Users size={14} /> {project.members.length}/{project.maxMembers} Membros
                </span>
             </div>

             <h1 className="text-3xl md:text-4xl font-display font-extrabold text-secondary dark:text-white mb-6">
               {project.title}
             </h1>

             <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
               {project.description}
             </p>

             <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
               <h3 className="font-bold text-secondary dark:text-white flex items-center gap-2 mb-4">
                 <Target className="text-primary" size={20} /> Objetivos Principais
               </h3>
               <ul className="space-y-3">
                 {project.objectives.map((obj, index) => (
                   <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                     <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                     <span className="text-sm font-medium">{obj}</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {/* Motivation Form */}
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
             <h3 className="text-xl font-bold text-secondary dark:text-white mb-2 flex items-center gap-2">
               <MessageSquare className="text-primary" size={24} /> Solicitar Participação
             </h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               Envie uma mensagem para o líder do projeto explicando por que você gostaria de participar e quais habilidades pode contribuir.
             </p>
             
             <form onSubmit={handleJoin}>
               <div className="mb-6">
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                   Sua Mensagem
                 </label>
                 <textarea 
                   rows={6}
                   className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 resize-none"
                   placeholder="Olá! Gostaria de participar deste projeto pois tenho experiência com Flutter e..."
                   value={motivation}
                   onChange={(e) => setMotivation(e.target.value)}
                   required
                 />
               </div>
               
               <div className="flex items-center justify-between">
                 <p className="text-xs text-gray-400 max-w-xs">
                   Ao solicitar, seu perfil acadêmico será compartilhado com o líder.
                 </p>
                 <button 
                  type="submit"
                  className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                 >
                   Enviar Solicitação <ShieldCheck size={18} />
                 </button>
               </div>
             </form>
          </div>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
           {/* Leader Card */}
           <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Líder do Projeto</h3>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white">
                 <UserIcon size={24} />
               </div>
               <div>
                 <p className="font-bold text-secondary dark:text-white">{project.leader.name}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{project.leader.role}</p>
                 <p className="text-[10px] text-primary font-bold mt-1">{project.leader.department}</p>
               </div>
             </div>
           </div>

           {/* Reward Card */}
           <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white shadow-lg shadow-yellow-500/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 opacity-90">
                 <Award size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">Recompensa</span>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black">{project.reward}</span>
                 <span className="text-sm font-bold opacity-80">XP</span>
               </div>
               <p className="text-xs mt-2 opacity-90 font-medium">Pontos distribuídos ao concluir o projeto.</p>
             </div>
           </div>

           {/* Team Slots */}
           <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Vagas na Equipe</h3>
              <div className="space-y-3">
                {/* Filled Slots */}
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <UserIcon size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{member.name}</span>
                     </div>
                     <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Ocupada</span>
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: project.maxMembers - project.members.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center justify-between p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-transparent opacity-60">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-400">Vaga Disponível</span>
                     </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">
                Restam {project.maxMembers - project.members.length} vagas para este projeto.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default JoinProjectScreen;