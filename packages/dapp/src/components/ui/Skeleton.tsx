'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-[var(--surface-2)]';
  const animateClasses = animate ? 'skeleton' : '';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px')
  };

  if (variant === 'circular' && !width) {
    style.width = style.height;
  }

  return (
    <div
      className={`${baseClasses} ${animateClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function VaultCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={60} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </div>
      <Skeleton variant="rectangular" height={40} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card space-y-3">
      <Skeleton variant="text" width="40%" height={12} />
      <Skeleton variant="text" width="70%" height={32} />
      <Skeleton variant="text" width="50%" height={12} />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="50%" height={12} />
      </div>
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  );
}
