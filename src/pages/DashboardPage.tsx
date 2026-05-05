import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/kpi/KPICard';
import { Card } from '@/components/ui/Card';
import { LeadStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { computeKPIs } from '@/lib/kpiCalculator';
import { formatDate } from '@/lib/dateUtils';
import { STAGES } from '@/constants/stages';
import { Users, UserCheck, TrendingUp, Clock, Plus } from 'lucide-react';

export function DashboardPage() {
  const leads = useLeadsStore(s => s.leads);
  const workflows = useWorkflowStore(s => s.workflows);
  const contracts = useWorkflowStore(s => s.contracts);

  const kpi = useMemo(() => computeKPIs(leads, contracts, workflows), [leads, contracts, workflows]);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const stageLabel = (n: number) => STAGES.find(s => s.number === n)?.label ?? `Etapa ${n}`;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen del proceso comercial y contractual"
        action={
          <Link to="/leads/new">
            <Button><Plus size={16} /> Nuevo Lead</Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Leads"
            value={String(kpi.totalLeads)}
            subtitle="Registrados en CRM"
            icon={<Users size={20} />}
            color="blue"
          />
          <KPICard
            title="Clientes Activos"
            value={String(kpi.activeClients)}
            subtitle="Matriculados"
            icon={<UserCheck size={20} />}
            color="green"
          />
          <KPICard
            title="Tasa de Conversión"
            value={`${(kpi.conversionRate * 100).toFixed(1)}%`}
            subtitle="Lead → Cliente activo"
            icon={<TrendingUp size={20} />}
            color="purple"
          />
          <KPICard
            title="Ciclo Promedio"
            value={kpi.avgCycleDays > 0 ? `${kpi.avgCycleDays}d` : '—'}
            subtitle="Días lead → matrícula"
            icon={<Clock size={20} />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Actividad Reciente" action={<Link to="/leads" className="text-xs text-brand-600 hover:underline">Ver todos</Link>}>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">Sin leads registrados aún.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentLeads.map(lead => (
                    <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{lead.companyName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.contactName} · {stageLabel(lead.currentStageNumber)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <LeadStatusBadge status={lead.status} />
                        <span className="text-xs text-gray-400">{formatDate(lead.updatedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card title="Estado del Embudo">
              <div className="space-y-2">
                {[1, 3, 6, 10, 13].map(n => {
                  const m = kpi.stageMetrics.find(s => s.stageNumber === n);
                  return (
                    <div key={n} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <p className="text-xs text-gray-600 truncate">{stageLabel(n)}</p>
                      <span className="text-sm font-bold text-brand-700 ml-2">{m?.entered ?? 0}</span>
                    </div>
                  );
                })}
              </div>
              <Link to="/kpi" className="mt-3 block text-center text-xs text-brand-600 hover:underline">Ver KPIs completos →</Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
