'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';

type Intensity = 'sm' | 'md' | 'lg';

const BLUR: Record<Intensity, string> = {
  sm: '12px',
  md: '20px',
  lg: '40px',
};

const GLOW: Record<Intensity, string> = {
  sm: '0 0 20px rgba(255, 255, 255, 0.08)',
  md: '0 0 30px rgba(255, 255, 255, 0.12)',
  lg: '0 0 50px rgba(255, 255, 255, 0.18)',
};

const SHADOW: Record<Intensity, string> = {
  sm: '0 8px 32px rgba(0, 0, 0, 0.2)',
  md: '0 12px 40px rgba(0, 0, 0, 0.25)',
  lg: '0 20px 60px rgba(0, 0, 0, 0.3)',
};

interface LiquidGlassCardProps {
  glowIntensity?: Intensity;
  shadowIntensity?: Intensity;
  borderRadius?: string;
  blurIntensity?: Intensity;
  draggable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LiquidGlassCard({
  glowIntensity = 'sm',
  shadowIntensity = 'sm',
  borderRadius = '12px',
  blurIntensity = 'sm',
  draggable = false,
  className,
  children,
}: LiquidGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      draggable={draggable}
      className={cn('relative overflow-hidden', className)}
      style={{
        borderRadius,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: `blur(${BLUR[blurIntensity]})`,
        WebkitBackdropFilter: `blur(${BLUR[blurIntensity]})`,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `${GLOW[glowIntensity]}, ${SHADOW[shadowIntensity]}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
      }}
    >
      {children}
    </div>
  );
}
