import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'shimmer' | 'pulse';
}

export function Skeleton({ className = '', variant = 'shimmer', ...props }: SkeletonProps) {
  const animationClass = variant === 'shimmer' ? 'skeleton-shimmer' : 'animate-pulse bg-bakery-200/60';
  return (
    <div
      className={`rounded-xl ${animationClass} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
