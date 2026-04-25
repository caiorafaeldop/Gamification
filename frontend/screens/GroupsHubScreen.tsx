import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, FlaskConical, BookOpen, Sparkles, ArrowRight, Search, Heart } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';
import type { Group } from '../services/group.service';

const GroupsHubScreen = () => {
  const navigate = useNavigate();
  const { groups, loading } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups
    .filter((g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.totalLikes ?? 0) - (a.totalLikes ?? 0));

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
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={FlaskConical}
        tagLabel="Laboratórios & Coletivos"
        title="Grupos & Iniciativas"
        description=" Cada grupo tem identidade visual própria e reúne projetos em torno de uma temática."
        actionButtons={heroActions}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={240} className="rounded-2xl" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  const color = group.color || '#29B6F6';
  const memberCount = group._count?.GroupMember || 0;
  const projectCount = group._count?.Project || 0;
  const totalLikes = group.totalLikes ?? 0;

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-surface-dark"
      style={{ ['--group-color' as any]: color }}
    >
      <div
        className="relative h-32 overflow-hidden rounded-t-2xl"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />

        <div className="absolute left-5 top-5 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            <Sparkles size={10} /> Grupo
          </span>
        </div>
      </div>

      <div className="absolute top-[104px] left-5 z-30">
        <div
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface-light bg-surface-light shadow-lg dark:border-surface-dark dark:bg-surface-dark group-hover:scale-105 transition-transform duration-300"
        >
          {group.logoUrl ? (
            <img src={group.logoUrl} alt={group.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <FlaskConical size={22} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-10">
        <h3
          className="text-lg font-display font-bold leading-tight text-secondary transition-colors dark:text-white"
          style={{ transition: 'color 0.2s' }}
        >
          <span className="group-hover:text-[var(--group-color)]">{group.name}</span>
        </h3>
        {group.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users size={14} style={{ color }} />
            {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} style={{ color }} />
            {projectCount} {projectCount === 1 ? 'projeto' : 'projetos'}
          </div>
          <div className="flex items-center gap-1.5">
            <Heart size={14} style={{ color }} />
            {totalLikes} {totalLikes === 1 ? 'like' : 'likes'}
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: color, boxShadow: `0 6px 18px -6px ${color}88` }}
          >
            Acessar Grupo
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default GroupsHubScreen;
