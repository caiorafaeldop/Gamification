import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className = '', variant = 'rectangular', width, height }: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  const roundedClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl"
  };

  const style = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseClasses} ${roundedClasses[variant]} ${className}`} 
      style={style}
    />
  );
};
