import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, LogIn } from 'lucide-react';

const ProjectListScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <div className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-surface-light dark:bg-surface-dark overflow-hidden rounded-3xl mx-4 sm:mx-8 mt-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 z-0 bg-network-pattern opacity-100 dark:opacity-30"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-bold text-xs mb-4 uppercase tracking-wider border border-primary/20">Explore & Colabore</span>
            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-secondary dark:text-white mb-2">
              Projetos Disponíveis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl text-lg">
              Encontre o projeto ideal para desenvolver suas habilidades, ganhar XP e conectar-se com outros estudantes.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="text-gray-400" size={20} />
              </span>
              <input className="w-full py-2.5 pl-10 pr-4 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-darker text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary" placeholder="Buscar projetos..." type="text" />
            </div>
            <button onClick={() => navigate('/new-project')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-sky-500 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Novo
            </button>
          </div>
        </div>
      </div>

      <section className="py-10 px-4 sm:px-8">
        <div className="space-y-12">
          {/* Featured Project */}
          <div onClick={() => navigate('/project-details')} className="cursor-pointer bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-primary via-blue-600 to-sky-400"></div>
            <div className="p-8 lg:p-10 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Destaque da Semana</span>
                <span className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" /> 4.9 XP Boost
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-secondary dark:text-white mb-4">
                Connecta Gamification Module
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Desenvolvimento do novo sistema de recompensas e níveis para a plataforma Connecta.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="flex-1 sm:flex-none bg-primary hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                  Entrar no projeto <LogIn size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article onClick={() => navigate('/join-project')} className="cursor-pointer bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full group">
              <div className="h-32 bg-gray-200 relative">
                <div className="absolute bottom-3 left-4 z-20">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Mobile Dev</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-display font-bold text-secondary dark:text-white leading-tight group-hover:text-primary transition-colors">App de Monitoria</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                  Criar um aplicativo mobile em Flutter para conectar alunos e monitores em tempo real.
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                    Entrar no projeto
                  </button>
                </div>
              </div>
            </article>
            
            <article className="cursor-pointer bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full group">
              <div className="h-32 bg-gray-200 relative">
                <div className="absolute bottom-3 left-4 z-20">
                   <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Data Science</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-display font-bold text-secondary dark:text-white leading-tight group-hover:text-primary transition-colors">Análise de Dados Acadêmicos</h4>
                </div>
                 <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                  Pipeline de dados para analisar desempenho estudantil usando Python e Pandas.
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                    Entrar no projeto
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectListScreen;