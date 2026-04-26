import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FlaskConical, Search, Compass, Users } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';
import GroupCarousel from '../components/GroupCarousel';

const GroupsHubScreen = () => {
  const navigate = useNavigate();
  const { groups, loading } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || parsed?.userId || null;
    } catch {
      return null;
    }
  }, []);

  const { myGroups, exploreGroups, myGroupIdMappings } = useMemo(() => {
    const mappings: Record<string, boolean> = {};
    const mine: typeof groups = [];
    const explore: typeof groups = [];

    const filtered = groups
      .filter((g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.totalLikes ?? 0) - (a.totalLikes ?? 0));

    filtered.forEach((g) => {
      const isMember = currentUserId && (g.GroupMember || []).some((m: any) => m.userId === currentUserId);
      if (isMember) {
        mappings[g.id] = true;
        mine.push(g);
      } else {
        explore.push(g);
      }
    });

    return { myGroups: mine, exploreGroups: explore, myGroupIdMappings: mappings };
  }, [groups, searchTerm, currentUserId]);

  const heroActions = (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
      <div className="relative w-full sm:w-64">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-gray-400" size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar grupos..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-surface-light py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-surface-darker dark:text-gray-200"
        />
      </div>
      <button
        onClick={() => navigate('/groups/new')}
        className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-sky-500"
      >
        <Plus size={16} /> Criar Grupo
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-10 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={FlaskConical}
        tagLabel="Catálogo de Grupos"
        title="Grupos & Iniciativas"
        description="Cada grupo tem identidade visual própria e reúne membros em torno de uma temática."
        actionButtons={heroActions}
      />

      {loading ? (
        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton height={24} width={220} className="rounded" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    height={200}
                    className="shrink-0 grow-0 basis-[19%] rounded-xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo ainda'}
          description={
            searchTerm
              ? `Nenhum resultado para "${searchTerm}". Tente outra busca ou crie um novo grupo.`
              : 'Seja pioneiro. Crie o primeiro grupo e convide colegas para colaborar.'
          }
          action={
            <button
              onClick={() => navigate('/groups/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
            >
              <Plus size={16} /> Criar Grupo
            </button>
          }
        />
      ) : (
        <div className="space-y-10">
          <GroupCarousel
            title="Seus Grupos"
            subtitle=""
            icon={<Users size={20} />}
            accentColor="#29B6F6"
            groups={myGroups}
            myGroupIdMappings={myGroupIdMappings}
            emptyMessage={
              searchTerm
                ? undefined
                : 'Você ainda não faz parte de nenhum grupo. Encontre um abaixo e participe!'
            }
          />

          <GroupCarousel
            title="Explorar Comunidade"
            subtitle="Grupos abertos e restritos disponíveis para participação"
            icon={<Compass size={20} />}
            accentColor="#10B981"
            groups={exploreGroups}
            myGroupIdMappings={myGroupIdMappings}
          />
        </div>
      )}
    </div>
  );
};

export default GroupsHubScreen;
