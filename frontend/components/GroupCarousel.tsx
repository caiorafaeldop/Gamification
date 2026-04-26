import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel';
import { Users, BookOpen, Heart, FlaskConical, Sparkles, ArrowRight, Lock, Globe } from 'lucide-react';
import type { Group } from '../services/group.service';

interface GroupCarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  groups: Group[];
  emptyMessage?: string;
  myGroupIdMappings?: Record<string, boolean>; // used to show "You are a member" or let them know they need to request
}

const GroupCard: React.FC<{ group: Group; isMember?: boolean }> = ({ group, isMember }) => {
  const navigate = useNavigate();
  const color = group.color || '#29B6F6';
  const memberCount = group._count?.GroupMember || 0;
  const projectCount = group._count?.Project || 0;
  const totalLikes = group.totalLikes ?? 0;

  return (
    <article
      onClick={() => navigate(`/groups/${group.id}`)}
      className="group relative flex h-full cursor-pointer flex-col rounded-2xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:shadow-2xl dark:border-gray-800 dark:bg-surface-dark"
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
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            {group.isRestricted ? <Lock size={10} /> : <Globe size={10} />}
            {group.isRestricted ? 'Restrito' : 'Aberto'}
          </span>
        </div>
        {isMember && (
          <div className="absolute right-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
              <Sparkles size={10} className="text-amber-500" /> Membro
            </span>
          </div>
        )}
      </div>

      <div className="absolute top-[104px] left-5 z-30">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-4 border-surface-light bg-surface-light shadow-lg transition-transform duration-300 group-hover:scale-105 dark:border-surface-dark dark:bg-surface-dark">
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
          <span className="group-hover:text-[var(--group-color)] line-clamp-1">{group.name}</span>
        </h3>
        {group.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users size={14} style={{ color }} /> {memberCount}
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} style={{ color }} /> {projectCount}
          </div>
          <div className="flex items-center gap-1.5">
            <Heart size={14} style={{ color }} /> {totalLikes}
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
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

const GroupCarousel: React.FC<GroupCarouselProps> = ({
  title,
  subtitle,
  icon,
  accentColor,
  groups,
  emptyMessage,
  myGroupIdMappings = {},
}) => {
  if (groups.length === 0) {
    if (!emptyMessage) return null;
    return (
      <section>
        <header className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-display font-bold text-secondary dark:text-white">
              {icon && (
                <span style={accentColor ? { color: accentColor } : undefined}>{icon}</span>
              )}
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </header>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-white/5">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-secondary dark:text-white">
            {icon && (
              <span style={accentColor ? { color: accentColor } : undefined}>{icon}</span>
            )}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
          {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
        </span>
      </header>

      <div className="relative px-1 sm:px-12">
        <Carousel opts={{ align: 'start', dragFree: true }}>
          <CarouselContent className="-ml-4 py-4">
            {groups.map((group) => (
              <CarouselItem
                key={group.id}
                className="pl-4 basis-[90%] sm:basis-[50%] md:basis-[40%] lg:basis-[33.33%] xl:basis-[33.33%]"
              >
                <GroupCard group={group} isMember={myGroupIdMappings[group.id]} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default GroupCarousel;
