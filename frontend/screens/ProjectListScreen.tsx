import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Check, Filter, ChevronDown, FolderOpen, Compass } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { joinProject } from '../services/project.service';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const ProjectListScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, refetch } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJoin = async (projectId: string) => {
    try {
      await joinProject(projectId);
      toast.success('Você entrou no projeto com sucesso!');
      refetch();
    } catch (err: any) {
      toast.error('Erro ao entrar no projeto: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredProjects = projects
    .filter((p: any) => {
      if (p.status === 'archived') return false;
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'joined') return p.members?.some((m: any) => m.userId === user?.id);
      if (filterStatus === 'notJoined') return !p.members?.some((m: any) => m.userId === user?.id);
      return true;
    })
    .sort((a: any, b: any) => {
      if (a.status === 'inactive' && b.status !== 'inactive') return 1;
      if (a.status !== 'inactive' && b.status === 'inactive') return -1;
      if (sortOrder === 'alpha') return a.title.localeCompare(b.title);
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const heroActions = (
    <>
      <div className="relative w-full sm:w-64">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-gray-400" size={18} />
        </span>
        <input
          className="h-11 w-full rounded-xl border border-gray-200 bg-surface-light py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-surface-darker dark:text-gray-200"
          placeholder="Buscar projetos..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-surface-light px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Filter size={16} />
          <span>Filtrar</span>
          <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 z-[100] mt-2 max-h-[60vh] w-56 overflow-y-auto rounded-xl border border-gray-100 bg-surface-light py-2 shadow-xl dark:border-gray-700 dark:bg-surface-dark animate-in fade-in zoom-in duration-200">
            <div className="mb-1 px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
            </div>
            {[
              { id: 'all', label: 'Todos os projetos' },
              { id: 'joined', label: 'Já participo' },
              { id: 'notJoined', label: 'Não participo' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setFilterStatus(opt.id); setIsFilterOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-primary/5 ${
                  filterStatus === opt.id ? 'font-bold text-primary' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label}
                {filterStatus === opt.id && <Check size={14} />}
              </button>
            ))}

            <div className="my-2 h-px bg-gray-100 dark:bg-gray-700" />

            <div className="mb-1 px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ordenação</span>
            </div>
            {[
              { id: 'newest', label: 'Mais recentes' },
              { id: 'oldest', label: 'Mais antigos' },
              { id: 'alpha', label: 'Ordem Alfabética' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setSortOrder(opt.id); setIsFilterOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-primary/5 ${
                  sortOrder === opt.id ? 'font-bold text-primary' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label}
                {sortOrder === opt.id && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/new-project')}
        className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-sky-500"
      >
        <Plus size={16} /> Novo
      </button>
    </>
  );

  if (loading) return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <Skeleton height="220px" className="w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-surface-light shadow-sm dark:border-gray-800 dark:bg-surface-dark">
            <Skeleton height={160} className="w-full rounded-none" />
            <div className="flex flex-1 flex-col space-y-3 p-5">
              <Skeleton width="70%" height={24} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="100%" height={40} className="mt-auto rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Compass}
        tagLabel="Explore & Colabore"
        title="Projetos Disponíveis"
        description="Encontre o projeto ideal para desenvolver suas habilidades, ganhar 🪙 e conectar-se com outros estudantes."
        actionButtons={heroActions}
      />

      <section>
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhum projeto encontrado"
            description={searchTerm ? `Nenhum resultado para "${searchTerm}". Tente outra busca.` : 'Ajuste os filtros ou crie um novo projeto.'}
            action={
              <button
                onClick={() => navigate('/new-project')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
              >
                <Plus size={16} /> Criar Projeto
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => (
              <article
                key={project.id}
                onClick={() => navigate(`/project-details/${project.id}`)}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 dark:border-gray-800 dark:bg-surface-dark"
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {project.coverUrl ? (
                    <img
                      src={project.coverUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent">
                      <Star size={48} className="text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 z-10 flex gap-2">
                    <span className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {project.category || 'Geral'}
                    </span>
                    {project.type && (
                      <span className="rounded bg-purple-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        {project.type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="text-lg font-display font-bold leading-tight text-secondary transition-colors group-hover:text-primary dark:text-white">
                    {project.title}
                  </h4>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary">
                      {project.leader?.name?.charAt(0) || 'L'}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Líder: <span className="font-semibold text-gray-700 dark:text-gray-200">{project.leader?.name || 'Desconhecido'}</span>
                    </span>
                  </div>
                  <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-700">
                    {project.members?.some((m: any) => m.userId === user?.id) ? (
                      <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <Check size={16} /> Você já participa
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleJoin(project.id); }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        Entrar no projeto
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectListScreen;
