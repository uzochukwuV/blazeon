'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const variantStyles = {
  default: 'card',
  interactive: 'card-interactive',
  glass: 'card-glass',
  gradient: 'card gradient-border',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// Card Header
export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Stat Card - for displaying metrics
export function StatCard({
  label,
  value,
  subvalue,
  trend,
  icon,
  color,
  className = '',
}: {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: { value: number; label?: string };
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}) {
  const trendColor = trend && trend.value >= 0 ? 'text-emerald-400' : 'text-red-400';
  const trendIcon = trend && trend.value >= 0 ? '↑' : '↓';

  return (
    <Card className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subvalue && <p className="text-sm text-[var(--text-secondary)] mt-1">{subvalue}</p>}
          {trend && (
            <p className={`text-xs mt-2 ${trendColor}`}>
              {trendIcon} {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ''}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: color ? `${color}20` : 'var(--surface-2)' }}
          >
            <span style={{ color: color || 'var(--text-secondary)' }}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Feature Card - for displaying vault features
export function FeatureCard({
  title,
  description,
  icon,
  color,
  selected,
  onClick,
  disabled,
  className = '',
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-4 rounded-xl border text-left transition-all duration-200
        ${selected
          ? 'border-white/20 bg-white/5'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div
        className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-colors"
        style={{ background: selected ? `${color}20` : 'var(--surface-2)' }}
      >
        <span style={{ color: selected ? color : 'var(--text-tertiary)' }}>{icon}</span>
      </div>
      <h4 className="text-sm font-medium" style={{ color: selected ? color : 'var(--text-secondary)' }}>
        {title}
      </h4>
      <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">{description}</p>
    </button>
  );
}

// Empty State Card
export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className = '',
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] mx-auto mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-white font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--text-tertiary)] mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </Card>
  );
}

// Info Card with colored left border
export function InfoCard({
  children,
  variant = 'info',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const colors = {
    info: 'border-l-blue-500 bg-blue-500/5',
    success: 'border-l-emerald-500 bg-emerald-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    error: 'border-l-red-500 bg-red-500/5',
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${colors[variant]} ${className}`}>
      {children}
    </div>
  );
}
