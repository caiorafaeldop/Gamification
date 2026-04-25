import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeroProps {
  icon: LucideIcon;
  tagLabel: string | ReactNode;
  title: string | ReactNode;
  description: string | ReactNode;
  actionButtons?: ReactNode;
  highlight?: ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  icon: Icon,
  tagLabel,
  title,
  description,
  actionButtons,
  highlight,
}) => {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-gray-100 bg-surface-light/90 p-6 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-surface-dark/80 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-network-pattern opacity-40 dark:opacity-10" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {typeof tagLabel === 'string' ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Icon size={12} />
              {tagLabel}
            </div>
          ) : (
            tagLabel
          )}
          <h1 className="mt-4 text-3xl font-display font-extrabold tracking-tight text-secondary dark:text-white lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        {highlight && <div className="shrink-0">{highlight}</div>}

        {actionButtons && (
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:shrink-0">
            {actionButtons}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHero;
