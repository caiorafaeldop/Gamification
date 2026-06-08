import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  key?: React.Key;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular', width, height }) => {
  const baseClasses =
    'relative overflow-hidden bg-gray-200/80 dark:bg-gray-700/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 dark:before:via-white/10 before:to-transparent';
  const roundedClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${roundedClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-3 ${className}`}>
    <Skeleton width="70%" height={24} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="90%" height={16} />
    <Skeleton width="60%" height={16} />
  </div>
);

export const SkeletonList: React.FC<SkeletonCardProps> = ({ count = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    ))}
  </div>
);
