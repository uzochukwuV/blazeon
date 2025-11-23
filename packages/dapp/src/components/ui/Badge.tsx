'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'cyan';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-[var(--surface-2)]', text: 'text-[var(--text-secondary)]', dot: 'bg-[var(--text-tertiary)]' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-500' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-500' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  className = '',
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${styles.bg} ${styles.text}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status Badge - Pre-configured variants for common statuses
export function StatusBadge({ status }: { status: 'active' | 'pending' | 'locked' | 'unlocked' | 'completed' | 'failed' }) {
  const configs: Record<string, { variant: BadgeVariant; label: string; dot: boolean; pulse: boolean }> = {
    active: { variant: 'success', label: 'Active', dot: true, pulse: true },
    pending: { variant: 'warning', label: 'Pending', dot: true, pulse: true },
    locked: { variant: 'error', label: 'Locked', dot: true, pulse: false },
    unlocked: { variant: 'success', label: 'Unlocked', dot: true, pulse: false },
    completed: { variant: 'info', label: 'Completed', dot: false, pulse: false },
    failed: { variant: 'error', label: 'Failed', dot: false, pulse: false },
  };

  const config = configs[status] || configs.pending;

  return (
    <Badge variant={config.variant} dot={config.dot} pulse={config.pulse}>
      {config.label}
    </Badge>
  );
}

// Vault Type Badge
export function VaultTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { variant: BadgeVariant; icon: string }> = {
    MasterVault: { variant: 'purple', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2' },
    TimeLockVault: { variant: 'info', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    MultiSigVault: { variant: 'purple', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
    SpendingLimitVault: { variant: 'warning', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01' },
    RecurringPaymentVault: { variant: 'pink', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9' },
    StreamVault: { variant: 'cyan', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    WhitelistVault: { variant: 'success', icon: 'M9 12l2 2 4-4m5.618-4.016' },
    TokenGatedVault: { variant: 'pink', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743' },
  };

  const config = configs[type] || { variant: 'default' as BadgeVariant, icon: '' };
  const displayName = type.replace('Vault', '');

  return (
    <Badge
      variant={config.variant}
      size="sm"
      icon={
        config.icon ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
          </svg>
        ) : undefined
      }
    >
      {displayName}
    </Badge>
  );
}

// Count Badge (for notifications, etc.)
export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
      {displayCount}
    </span>
  );
}
