import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Award, Users, CheckCircle2, MessageSquare, ShieldCheck, User as UserIcon, Rocket } from 'lucide-react';
import { PageHero, SurfaceCard, SectionHeader } from '../components/ui';

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
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Rocket}
        tagLabel={
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar para Projetos
          </button>
        }
        title={project.title}
        description={project.description}
        highlight={
          <div className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/20">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {project.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
              <Users size={14} /> {project.members.length}/{project.maxMembers} Membros
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left Column: Project Details */}
        <div className="space-y-6 lg:col-span-2">
          <SurfaceCard padding="lg">
             <SectionHeader
               icon={<Target size={22} />}
               title="Objetivos Principais"
               description="O que será entregue ao final do projeto."
             />
             <div className="mt-5">
               <ul className="space-y-3">
                 {project.objectives.map((obj, index) => (
                   <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                     <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                     <span className="text-sm font-medium">{obj}</span>
                   </li>
                 ))}
               </ul>
             </div>
          </SurfaceCard>

          {/* Motivation Form */}
          <SurfaceCard padding="lg">
             <SectionHeader
               icon={<MessageSquare size={22} />}
               title="Solicitar Participação"
               description="Envie uma mensagem para o líder explicando por que você gostaria de participar."
             />

             <form onSubmit={handleJoin} className="mt-5">
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
          </SurfaceCard>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
           {/* Leader Card */}
           <SurfaceCard padding="lg">
             <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Líder do Projeto</h3>
             <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                 <UserIcon size={24} />
               </div>
               <div>
                 <p className="font-bold text-secondary dark:text-white">{project.leader.name}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{project.leader.role}</p>
                 <p className="mt-1 text-[10px] font-bold text-primary">{project.leader.department}</p>
               </div>
             </div>
           </SurfaceCard>

           {/* Reward Card */}
           <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 text-white shadow-lg shadow-yellow-500/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 opacity-90">
                 <Award size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">Recompensa</span>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black">{project.reward}</span>
                 <span className="text-sm font-bold opacity-80">🪙</span>
               </div>
               <p className="text-xs mt-2 opacity-90 font-medium">Pontos distribuídos ao concluir o projeto.</p>
             </div>
           </div>

           {/* Team Slots */}
           <SurfaceCard padding="lg">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Vagas na Equipe</h3>
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
              <p className="mt-4 text-center text-xs text-gray-400">
                Restam {project.maxMembers - project.members.length} vagas para este projeto.
              </p>
           </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

export default JoinProjectScreen;