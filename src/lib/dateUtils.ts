export function diffDays(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDuration(days: number): string {
  if (days === 0) return 'Mismo día';
  if (days === 1) return '1 día';
  return `${days} días`;
}
