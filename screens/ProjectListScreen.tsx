import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, LogIn, Loader } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { joinProject } from '../services/project.service';
import api from '../services/api';

const ProjectListScreen = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const handleJoin = async (projectId: string) => {
      try {
          await joinProject(projectId);
          alert('Você entrou no projeto com sucesso!');
          refetch();
      } catch (err: any) {
          alert('Erro ao entrar no projeto: ' + (err.response?.data?.message || err.message));
      }
  };

  const filteredProjects = projects.filter((p: any) => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;

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
              <input 
                className="w-full py-2.5 pl-10 pr-4 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-darker text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary" 
                placeholder="Buscar projetos..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => navigate('/new-project')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-sky-500 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Novo
            </button>
          </div>
        </div>
      </div>

      <section className="py-10 px-4 sm:px-8">
        <div className="space-y-12">
          {/* Grid of Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.length === 0 ? (
                <p className="col-span-3 text-center text-gray-500">Nenhum projeto encontrado.</p>
            ) : filteredProjects.map((project: any) => (
                <article key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full group">
                <div className="h-32 bg-gray-200 relative">
                    <div className="absolute bottom-3 left-4 z-20">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{project.category || 'Geral'}</span>
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-display font-bold text-secondary dark:text-white leading-tight group-hover:text-primary transition-colors">{project.title}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {project.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleJoin(project.id); }}
                        className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        Entrar no projeto
                    </button>
                    </div>
                </div>
                </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectListScreen;