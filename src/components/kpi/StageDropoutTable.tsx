import type { StageMetrics } from '@/types';

interface Props { metrics: StageMetrics[] }

export function StageDropoutTable({ metrics }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">#</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Etapa</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Entraron</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Completaron</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Abandonos</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">% Abandono</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Días prom.</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => {
            const isHighDropout = m.dropoutRate > 0.3;
            return (
              <tr key={m.stageNumber} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{m.stageNumber}</td>
                <td className="py-2.5 px-3 text-gray-700 font-medium">{m.stageLabel}</td>
                <td className="py-2.5 px-3 text-right text-gray-700">{m.entered}</td>
                <td className="py-2.5 px-3 text-right text-green-600 font-medium">{m.completed}</td>
                <td className="py-2.5 px-3 text-right text-gray-500">{m.dropped}</td>
                <td className={`py-2.5 px-3 text-right font-semibold ${isHighDropout ? 'text-red-600' : 'text-gray-600'}`}>
                  {m.entered > 0 ? `${(m.dropoutRate * 100).toFixed(0)}%` : '—'}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-500">
                  {m.avgDaysToComplete > 0 ? `${m.avgDaysToComplete}d` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
