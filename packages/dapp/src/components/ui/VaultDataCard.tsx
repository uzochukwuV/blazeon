'use client';

import React from 'react';
import { ProgressRing } from './ProgressRing';

interface VaultDataCardProps {
  type: 'timelock' | 'spending' | 'stream' | 'recurring' | 'multisig' | 'token' | 'whitelist' | 'master';
  data: {
    balance: bigint;
    // TimeLock specific
    isUnlocked?: boolean;
    blocksUntilUnlock?: number;
    unlockBlock?: number;
    // Spending specific
    dailyLimit?: bigint;
    spentToday?: bigint;
    remainingLimit?: bigint;
    // Stream specific
    streamProgress?: number;
    claimableAmount?: bigint;
    totalAmount?: bigint;
    // Recurring specific
    canClaim?: boolean;
    nextPaymentBlock?: number;
    paymentsRemaining?: number;
    paymentAmount?: bigint;
    // MultiSig specific
    requiredSignatures?: number;
    totalSigners?: number;
    // Token specific
    minFungibleBalance?: bigint;
    accessTokenCategory?: string;
  };
}

const formatBch = (sats: bigint): string => {
  const bch = Number(sats) / 100000000;
  return bch.toFixed(bch < 0.01 ? 6 : 4);
};

const formatBlocks = (blocks: number): string => {
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `~${hours}h`;
  const days = Math.floor(hours / 24);
  return `~${days}d`;
};

export function VaultDataCard({ type, data }: VaultDataCardProps) {
  const renderTimeLockData = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${data.isUnlocked ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-sm text-[var(--text-secondary)]">
            {data.isUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        {!data.isUnlocked && data.blocksUntilUnlock && (
          <span className="text-sm font-mono text-white">
            {data.blocksUntilUnlock.toLocaleString()} blocks
          </span>
        )}
      </div>
      {!data.isUnlocked && data.blocksUntilUnlock && (
        <div className="space-y-2">
          <div className="progress-bar">
            <div
              className="progress-bar-fill bg-blue-500"
              style={{ width: `${Math.max(5, 100 - (data.blocksUntilUnlock / (data.unlockBlock || 1)) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Unlocks in {formatBlocks(data.blocksUntilUnlock)}
          </p>
        </div>
      )}
    </div>
  );

  const renderSpendingData = () => {
    const spent = Number(data.spentToday || 0n);
    const limit = Number(data.dailyLimit || 1n);
    const percentage = Math.min(100, (spent / limit) * 100);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">Daily Limit</span>
          <span className="font-mono text-white">{formatBch(data.dailyLimit || 0n)} BCH</span>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={percentage}
            size={80}
            strokeWidth={6}
            color={percentage > 80 ? '#ef4444' : percentage > 50 ? '#f59e0b' : '#22c55e'}
          >
            <span className="text-xs text-[var(--text-secondary)]">used</span>
          </ProgressRing>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-[var(--text-secondary)]">Spent Today</p>
            <p className="text-lg font-semibold text-white">{formatBch(data.spentToday || 0n)} BCH</p>
            <p className="text-xs text-emerald-400">
              {formatBch(data.remainingLimit || 0n)} BCH remaining
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStreamData = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <ProgressRing
          progress={data.streamProgress || 0}
          size={100}
          strokeWidth={8}
          color="#06b6d4"
        >
          <div className="text-center">
            <span className="text-lg font-bold text-white">{data.streamProgress || 0}%</span>
            <p className="text-xs text-[var(--text-tertiary)]">streamed</p>
          </div>
        </ProgressRing>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)]">Claimable</p>
          <p className="font-mono text-emerald-400">{formatBch(data.claimableAmount || 0n)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)]">Total</p>
          <p className="font-mono text-white">{formatBch(data.totalAmount || 0n)}</p>
        </div>
      </div>
    </div>
  );

  const renderRecurringData = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.canClaim ? 'bg-emerald-500 animate-pulse' : 'bg-[var(--border)]'}`} />
          <span className="text-sm text-[var(--text-secondary)]">
            {data.canClaim ? 'Payment Ready' : 'Pending'}
          </span>
        </div>
        <span className="font-mono text-white">{formatBch(data.paymentAmount || 0n)} BCH</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg">
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Payments Remaining</p>
          <p className="text-xl font-bold text-white">{data.paymentsRemaining || 0}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-tertiary)]">Next Payment</p>
          <p className="text-sm font-mono text-white">
            Block #{(data.nextPaymentBlock || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  const renderMultiSigData = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: data.totalSigners || 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
              ${i < (data.requiredSignatures || 2) ? 'border-purple-500 bg-purple-500/20' : 'border-[var(--border)]'}
            `}
          >
            <span className={`text-sm font-bold ${i < (data.requiredSignatures || 2) ? 'text-purple-400' : 'text-[var(--text-tertiary)]'}`}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        <span className="text-white font-semibold">{data.requiredSignatures || 2}</span> of{' '}
        <span className="text-white font-semibold">{data.totalSigners || 3}</span> signatures required
      </p>
    </div>
  );

  const renderTokenData = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-[var(--surface-2)] rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-secondary)]">Required Token</p>
          <p className="font-mono text-xs text-white truncate">
            {data.accessTokenCategory?.slice(0, 16)}...
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Min Balance</span>
        <span className="font-mono text-white">{(data.minFungibleBalance || 0n).toLocaleString()}</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'timelock': return renderTimeLockData();
      case 'spending': return renderSpendingData();
      case 'stream': return renderStreamData();
      case 'recurring': return renderRecurringData();
      case 'multisig': return renderMultiSigData();
      case 'token': return renderTokenData();
      default: return null;
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Vault Details
        </h3>
        <span className="text-xs text-[var(--text-tertiary)]">
          {formatBch(data.balance)} BCH
        </span>
      </div>
      {renderContent()}
    </div>
  );
}
