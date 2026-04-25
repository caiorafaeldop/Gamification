import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Search,
  Plus,
  TrendingUp,
  Sparkles,
  Clock,
  Users,
  FlaskConical,
  Tag,
  UserCheck,
  Rocket,
} from 'lucide-react';
import { getCatalog, CatalogProject } from '../services/catalog.service';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';
import ProjectCarousel from '../components/ProjectCarousel';

const ProjectsScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['catalog'],
    queryFn: getCatalog,
    staleTime: 60 * 1000,
  });

  const filteredCatalog = useMemo(() => {
    if (!catalog) return null;
    if (!search.trim()) return catalog;
    const term = search.toLowerCase();
    const filterList = (list: CatalogProject[]) =>
      list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.Group?.name.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term),
      );
    return {
      yours: filterList(catalog.yours),
      trending: filterList(catalog.trending),
      recent: filterList(catalog.recent),
      openForJoining: filterList(catalog.openForJoining),
      byGroup: catalog.byGroup
        .map((row) => ({ ...row, projects: filterList(row.projects) }))
        .filter((row) => row.projects.length > 0),
      byCategory: catalog.byCategory
        .map((row) => ({ ...row, projects: filterList(row.projects) }))
        .filter((row) => row.projects.length > 0),
      fromYourGroups: filterList(catalog.fromYourGroups),
    };
  }, [catalog, search]);

  const heroActions = (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
      <div className="relative w-full sm:w-72">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-gray-400" size={18} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar projeto, grupo ou categoria..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-surface-light py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-surface-darker dark:text-gray-200"
        />
      </div>
      <button
        onClick={() => navigate('/new-project')}
        className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-sky-500"
      >
        <Plus size={16} /> Novo projeto
      </button>
    </div>
  );

  const totalProjects = catalog
    ? new Set(
        [
          ...catalog.yours,
          ...catalog.trending,
          ...catalog.recent,
          ...catalog.openForJoining,
          ...catalog.fromYourGroups,
          ...catalog.byGroup.flatMap((g) => g.projects),
          ...catalog.byCategory.flatMap((c) => c.projects),
        ].map((p) => p.id),
      ).size
    : 0;

  const allRowsEmpty =
    filteredCatalog &&
    filteredCatalog.yours.length === 0 &&
    filteredCatalog.trending.length === 0 &&
    filteredCatalog.recent.length === 0 &&
    filteredCatalog.openForJoining.length === 0 &&
    filteredCatalog.byGroup.length === 0 &&
    filteredCatalog.byCategory.length === 0 &&
    filteredCatalog.fromYourGroups.length === 0;

  return (
    <div className="mx-auto max-w-[1480px] space-y-10 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Compass}
        tagLabel="Catálogo de projetos"
        title="Projetos"
        description={
          isLoading
            ? 'Carregando catálogo...'
            : `Descubra e participe. ${totalProjects} ${totalProjects === 1 ? 'projeto' : 'projetos'} no catálogo.`
        }
        actionButtons={heroActions}
      />

      {isLoading ? (
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton height={24} width={220} className="rounded" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    height={260}
                    className="shrink-0 grow-0 basis-[19%] rounded-xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : allRowsEmpty ? (
        <EmptyState
          icon={Rocket}
          title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto no catálogo'}
          description={
            search
              ? `Nenhum resultado para "${search}". Ajuste a busca.`
              : 'Crie o primeiro projeto e ele aparece aqui.'
          }
          action={
            <button
              onClick={() => navigate('/new-project')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
            >
              <Plus size={16} /> Novo projeto
            </button>
          }
        />
      ) : (
        filteredCatalog && (
          <div className="space-y-10">
            <ProjectCarousel
              title="Seus projetos"
              subtitle="Onde você é líder ou membro"
              icon={<UserCheck size={20} />}
              accentColor="#29B6F6"
              projects={filteredCatalog.yours}
              emptyMessage={
                search
                  ? undefined
                  : 'Você ainda não está em nenhum projeto. Crie um ou peça pra entrar em algum!'
              }
            />

            <ProjectCarousel
              title="Em alta"
              subtitle="Mais curtidos nos últimos 7 dias"
              icon={<TrendingUp size={20} />}
              accentColor="#F43F5E"
              projects={filteredCatalog.trending}
            />

            <ProjectCarousel
              title="Recém-lançados"
              subtitle="Criados nas últimas 2 semanas"
              icon={<Clock size={20} />}
              accentColor="#A855F7"
              projects={filteredCatalog.recent}
            />

            <ProjectCarousel
              title="Aceitando membros"
              subtitle="Demonstre interesse e entre"
              icon={<Sparkles size={20} />}
              accentColor="#10B981"
              projects={filteredCatalog.openForJoining}
            />

            {filteredCatalog.byGroup.map((row) => (
              <ProjectCarousel
                key={`g-${row.group.id}`}
                title={row.group.name}
                subtitle="Projetos deste grupo"
                icon={<FlaskConical size={20} />}
                accentColor={row.group.color || '#29B6F6'}
                projects={row.projects}
              />
            ))}

            {filteredCatalog.byCategory.map((row) => (
              <ProjectCarousel
                key={`c-${row.category}`}
                title={row.category}
                subtitle="Categoria"
                icon={<Tag size={20} />}
                projects={row.projects}
              />
            ))}

            <ProjectCarousel
              title="Do seu grupo"
              subtitle="Dos seus grupos onde você ainda não participa"
              icon={<Users size={20} />}
              accentColor="#F59E0B"
              projects={filteredCatalog.fromYourGroups}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ProjectsScreen;
