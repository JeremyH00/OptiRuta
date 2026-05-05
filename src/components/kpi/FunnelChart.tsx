import type { StageMetrics } from '@/types';

interface Props { metrics: StageMetrics[] }

export function FunnelChart({ metrics }: Props) {
  const maxEntered = Math.max(...metrics.map(m => m.entered), 1);

  return (
    <div className="space-y-2">
      {metrics.map(m => {
        const pct = maxEntered > 0 ? (m.entered / maxEntered) * 100 : 0;
        const compPct = m.entered > 0 ? (m.completed / m.entered) * 100 : 0;

        return (
          <div key={m.stageNumber} className="flex items-center gap-3">
            <div className="w-5 text-xs text-gray-400 text-right shrink-0">{m.stageNumber}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-gray-600 truncate max-w-36">{m.stageLabel}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{m.entered} leads</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-brand-200 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-brand-600 rounded-full transition-all"
                  style={{ width: `${(pct * compPct) / 100}%` }}
                />
              </div>
            </div>
            <div className="w-14 text-xs text-right shrink-0">
              <span className={m.dropoutRate > 0.3 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                {m.entered > 0 ? `${(m.dropoutRate * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className="w-5" />
        <div className="flex-1 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-brand-200" /> Leads que entraron</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-brand-600" /> Completaron la etapa</div>
        </div>
        <div className="w-14 text-xs text-right text-gray-500">Abandono</div>
      </div>
    </div>
  );
}
