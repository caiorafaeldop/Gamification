import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, LogIn, Loader } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { joinProject } from '../services/project.service';
import api from '../services/api';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const ProjectListScreen = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const handleJoin = async (projectId: string) => {
    try {
      await joinProject(projectId);
      toast.success('Você entrou no projeto com sucesso!');
      refetch();
    } catch (err: any) {
      toast.error('Erro ao entrar no projeto: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredProjects = projects.filter((p: any) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-full">
      {/* Header Skeleton */}
      <div className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-surface-light dark:bg-surface-dark overflow-hidden rounded-3xl mx-4 sm:mx-8 mt-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
          <div className="w-full">
            <Skeleton width={120} height={24} className="mb-4 rounded-full" />
            <Skeleton width={300} height={48} className="mb-2" />
            <Skeleton width="60%" height={24} />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Skeleton width={256} height={44} className="rounded-lg" />
            <Skeleton width={100} height={44} className="rounded-lg" />
          </div>
        </div>
      </div>

      <section className="py-10 px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col">
              <Skeleton height={128} className="w-full rounded-none" />
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <Skeleton width="70%" height={28} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="90%" height={16} />
                <Skeleton width="60%" height={16} />
                <div className="mt-auto pt-4">
                  <Skeleton width="100%" height={40} className="rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

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
              <article key={project.id} onClick={() => navigate(`/project-details/${project.id}`)} className="cursor-pointer bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {project.coverUrl ? (
                    <img
                      src={project.coverUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent flex items-center justify-center">
                      <Star size={48} className="text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 z-20">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{project.category || 'Geral'}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-display font-bold text-secondary dark:text-white leading-tight group-hover:text-primary transition-colors">{project.title}</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold border border-primary/20">
                      {project.leader?.name?.charAt(0) || 'L'}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Líder: <span className="font-semibold text-gray-700 dark:text-gray-200">{project.leader?.name || 'Desconhecido'}</span></span>
                  </div>
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