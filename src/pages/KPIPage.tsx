import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/kpi/KPICard';
import { FunnelChart } from '@/components/kpi/FunnelChart';
import { StageDropoutTable } from '@/components/kpi/StageDropoutTable';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { computeKPIs } from '@/lib/kpiCalculator';
import {
  TrendingUp, Users, Clock, ClipboardCheck, RefreshCw, PenLine
} from 'lucide-react';

export function KPIPage() {
  const leads = useLeadsStore(s => s.leads);
  const workflows = useWorkflowStore(s => s.workflows);
  const contracts = useWorkflowStore(s => s.contracts);

  const kpi = useMemo(() => computeKPIs(leads, contracts, workflows), [leads, contracts, workflows]);

  return (
    <div>
      <PageHeader
        title="Indicadores KPI"
        subtitle="Métricas del proceso comercial y contractual · Actualizado en tiempo real"
      />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">6.1 Indicadores de Conversión</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Tasa de Conversión"
              value={`${(kpi.conversionRate * 100).toFixed(1)}%`}
              subtitle="Benchmark B2B SaaS: 15–25%"
              icon={<TrendingUp size={20} />}
              color="green"
            />
            <KPICard
              title="Total Leads"
              value={String(kpi.totalLeads)}
              subtitle={`${kpi.activeClients} convertidos a clientes`}
              icon={<Users size={20} />}
              color="blue"
            />
            <KPICard
              title="Ciclo Promedio"
              value={kpi.avgCycleDays > 0 ? `${kpi.avgCycleDays} días` : '—'}
              subtitle="Objetivo: ≤ 18 días hábiles"
              icon={<Clock size={20} />}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">6.2 Indicadores de Calidad</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="% Rechazo en Validación"
              value={kpi.validationRejectionPct > 0 ? `${(kpi.validationRejectionPct * 100).toFixed(1)}%` : '0%'}
              subtitle="Expedientes que requirieron corrección"
              icon={<ClipboardCheck size={20} />}
              color={kpi.validationRejectionPct > 0.2 ? 'red' : 'green'}
            />
            <KPICard
              title="Total Reprocesos"
              value={String(kpi.totalReprocessingCount)}
              subtitle="Objetivo: 0 reprocesos"
              icon={<RefreshCw size={20} />}
              color={kpi.totalReprocessingCount > 0 ? 'orange' : 'green'}
            />
            <KPICard
              title="Tiempo Promedio Firmas"
              value={kpi.avgSigningDays > 0 ? `${kpi.avgSigningDays} días` : '—'}
              subtitle="Etapas 8 y 9 — Objetivo: ≤ 3 días"
              icon={<PenLine size={20} />}
              color={kpi.avgSigningDays > 3 ? 'orange' : 'green'}
            />
          </div>
        </div>

        {/* Funnel chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Embudo de Conversión" subtitle="Leads por etapa — barra clara: entrados, barra oscura: completados">
            {kpi.totalLeads === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos aún. Registra leads para ver el embudo.</p>
            ) : (
              <FunnelChart metrics={kpi.stageMetrics} />
            )}
          </Card>

          <Card title="Resumen de Etapas" subtitle="Tasa de abandono por etapa">
            {kpi.totalLeads === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos aún.</p>
            ) : (
              <StageDropoutTable metrics={kpi.stageMetrics} />
            )}
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-800 mb-2">Guía de lectura</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• <strong>Tasa de conversión</strong> saludable en mercado B2B SaaS: 15–25%</li>
            <li>• <strong>Tiempo total de ciclo</strong> esperado: 8–18 días hábiles</li>
            <li>• <strong>Cuello de botella</strong> más frecuente: Etapas 8 y 9 (firmas) — dependen del cliente</li>
            <li>• <strong>Alto % de abandono en etapa 3</strong>: problema en calidad de leads (criterios de entrada)</li>
            <li>• <strong>Alto % de rechazo en validación</strong>: errores en etapas anteriores no detectados a tiempo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
