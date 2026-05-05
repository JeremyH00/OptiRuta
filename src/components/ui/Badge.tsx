import React from 'react';
import type { StageStatus } from '@/types';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange' | 'gray';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  gray: 'bg-gray-100 text-gray-500',
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StageStatusBadge({ status }: { status: StageStatus }) {
  const config: Record<StageStatus, { label: string; variant: Variant }> = {
    locked: { label: 'Bloqueada', variant: 'gray' },
    pending: { label: 'Pendiente', variant: 'warning' },
    active: { label: 'En progreso', variant: 'info' },
    complete: { label: 'Completada', variant: 'success' },
    skipped: { label: 'N/A', variant: 'gray' },
    blocked: { label: 'Rechazada', variant: 'error' },
  };
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function LeadStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: Variant }> = {
    active: { label: 'Activo', variant: 'info' },
    discarded: { label: 'Descartado', variant: 'error' },
    paused: { label: 'En seguimiento', variant: 'warning' },
    converted: { label: 'Cliente activo', variant: 'success' },
  };
  const c = config[status] ?? { label: status, variant: 'default' as Variant };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
