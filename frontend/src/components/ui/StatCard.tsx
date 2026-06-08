import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: 'primary' | 'gold' | 'green' | 'purple' | 'red';
  className?: string;
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-surface-light p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-surface-dark',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
            accentMap[accent]
          )}
        >
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-display font-bold text-secondary dark:text-white">
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
