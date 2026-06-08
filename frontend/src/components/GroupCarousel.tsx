import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel';
import type { Group } from '../services/group.service';
import GroupCard from './GroupCard';

interface GroupCarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  groups: Group[];
  emptyMessage?: string;
  myGroupIdMappings?: Record<string, boolean>; // used to show "You are a member" or let them know they need to request
}

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
