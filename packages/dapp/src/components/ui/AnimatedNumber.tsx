'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number | bigint;
  formatter?: (value: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatter = (v) => v.toLocaleString(),
  duration = 500,
  className = '',
}: AnimatedNumberProps) {
  const numValue = typeof value === 'bigint' ? Number(value) : value;
  const [displayValue, setDisplayValue] = useState(numValue);
  const previousValue = useRef(numValue);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = numValue;
    const startTime = Date.now();
    const diff = endValue - startValue;

    if (diff === 0) return;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + diff * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [numValue, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
}

// Pre-configured formatters
export function AnimatedBCH({
  sats,
  className = '',
}: {
  sats: bigint;
  className?: string;
}) {
  const formatBch = (v: number) => {
    const bch = v / 100000000;
    return bch.toFixed(bch < 0.01 ? 6 : 4) + ' BCH';
  };

  return (
    <AnimatedNumber
      value={sats}
      formatter={formatBch}
      className={className}
    />
  );
}

export function AnimatedUSD({
  sats,
  rate = 350,
  className = '',
}: {
  sats: bigint;
  rate?: number;
  className?: string;
}) {
  const formatUsd = (v: number) => {
    const bch = v / 100000000;
    const usd = bch * rate;
    return '$' + usd.toFixed(2);
  };

  return (
    <AnimatedNumber
      value={sats}
      formatter={formatUsd}
      className={className}
    />
  );
}

export function AnimatedPercentage({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const formatPercent = (v: number) => {
    return v.toFixed(1) + '%';
  };

  return (
    <AnimatedNumber
      value={value}
      formatter={formatPercent}
      className={className}
    />
  );
}

// Countdown timer component
export function Countdown({
  blocks,
  className = '',
}: {
  blocks: number;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const minutes = blocks * 10;
    if (minutes < 60) {
      setTimeLeft(`~${minutes} min`);
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        setTimeLeft(`~${hours}h ${minutes % 60}m`);
      } else {
        const days = Math.floor(hours / 24);
        setTimeLeft(`~${days}d ${hours % 24}h`);
      }
    }
  }, [blocks]);

  return (
    <span className={`font-mono ${className}`}>
      {timeLeft}
    </span>
  );
}
