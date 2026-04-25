import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, Search, Star, Users, Globe, Sparkles, ArrowRight, FlaskConical, Rocket } from 'lucide-react';
import { getExploreProjects, ExploreProject } from '../services/explore.service';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';

const ExploreProjectsScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['explore-projects'],
    queryFn: getExploreProjects,
    staleTime: 60 * 1000,
  });

  const projects = useMemo(() => {
    const list = data ?? [];
    return list.filter((p) => {
      if (filter === 'open' && !p.isJoiningOpen) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.Group?.name.toLowerCase().includes(term)
      );
    });
  }, [data, search, filter]);

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Compass}
        tagLabel="Marketplace de projetos abertos"
        title="Explorar Projetos"
        description="Descubra projetos públicos da comunidade Connecta. Demonstre interesse em iniciativas abertas para se conectar com líderes e times."
        actionButtons={
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="text-gray-400" size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-surface-light py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-surface-darker dark:text-gray-200"
              />
            </div>
            <div className="flex rounded-xl border border-gray-200 bg-gray-100/70 p-1 shadow-inner dark:border-gray-700 dark:bg-white/5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'open', label: 'Abertos' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                    filter === opt.id
                      ? 'bg-surface-light text-secondary shadow-md dark:bg-surface-dark dark:text-white'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={320} className="rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto público'}
          description={
            search
              ? `Nenhum resultado para "${search}". Ajuste a busca ou tente outro filtro.`
              : 'Volte em breve. Novos projetos públicos aparecem aqui.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ExploreProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ExploreProjectCard: React.FC<{ project: ExploreProject }> = ({ project }) => {
  const navigate = useNavigate();
  const color = project.Group?.color || project.color || '#29B6F6';

  return (
    <article
      onClick={() => navigate(`/project-landing/${project.id}`)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-surface-dark"
    >
      <div className="relative h-44 overflow-hidden bg-gray-200">
        {project.coverUrl ? (
          <img
            src={project.coverUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)` }}
          >
            <Star size={48} style={{ color: `${color}55` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            <Globe size={10} /> Público
          </span>
          {project.isJoiningOpen && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: color }}>
              <Sparkles size={10} /> Aberto
            </span>
          )}
        </div>

        {project.Group && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/30 shadow-lg"
              style={{ backgroundColor: project.Group.logoUrl ? undefined : color }}
            >
              {project.Group.logoUrl ? (
                <img src={project.Group.logoUrl} alt={project.Group.name} className="h-full w-full object-cover" />
              ) : (
                <FlaskConical className="text-white" size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Grupo</p>
              <p className="truncate text-[11px] font-bold text-white">{project.Group.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {project.category && (
          <span className="inline-flex w-max items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${color}15`, color }}>
            {project.category}
          </span>
        )}

        <h4 className="mt-2 text-lg font-display font-bold leading-tight text-secondary dark:text-white">
          <span
            style={{ ['--project-color' as any]: color }}
            className="transition-colors group-hover:text-[var(--project-color)]"
          >
            {project.title}
          </span>
        </h4>
        <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>

        <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            {project.leader.avatarUrl ? (
              <img src={project.leader.avatarUrl} alt={project.leader.name} className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: project.leader.avatarColor || color }}
              >
                {project.leader.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold">{project.leader.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            {project._count?.members || 0}
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-700 grid grid-cols-2 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/kanban/${project.id}`); }}
            className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider bg-white dark:bg-white/10 text-secondary dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
          >
            Kanban
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/project-landing/${project.id}`); }}
            className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}55` }}
          >
            Detalhes
          </button>
        </div>
      </div>
    </article>
  );
};

export default ExploreProjectsScreen;
