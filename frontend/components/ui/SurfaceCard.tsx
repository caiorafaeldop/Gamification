import React from 'react';
import { cn } from '../../utils/cn';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingClasses: Record<NonNullable<SurfaceCardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className,
  padding = 'md',
  elevated = true,
  ...props
}) => (
  <div
    className={cn(
      'rounded-2xl border border-gray-100 bg-surface-light dark:border-gray-800 dark:bg-surface-dark',
      elevated && 'shadow-sm',
      paddingClasses[padding],
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default SurfaceCard;
