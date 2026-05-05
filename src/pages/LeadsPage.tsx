import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LeadStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLeadsStore } from '@/store/leadsStore';
import { STAGES } from '@/constants/stages';
import { formatDate } from '@/lib/dateUtils';
import { Plus, Search, Users } from 'lucide-react';
import type { LeadStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Seguimiento', value: 'paused' },
  { label: 'Clientes', value: 'converted' },
  { label: 'Descartados', value: 'discarded' },
];

export function LeadsPage() {
  const leads = useLeadsStore(s => s.leads);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = leads
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l =>
      !query ||
      l.companyName.toLowerCase().includes(query.toLowerCase()) ||
      l.contactName.toLowerCase().includes(query.toLowerCase()) ||
      l.contactEmail.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const stageLabel = (n: number) => STAGES.find(s => s.number === n)?.label ?? `Etapa ${n}`;
  const sourceLabel: Record<string, string> = {
    inbound_form: 'Formulario web',
    inbound_webinar: 'Webinar',
    inbound_seo: 'SEO',
    outbound_prospecting: 'Prospección',
    referral: 'Referido',
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} leads registrados`}
        action={
          <Link to="/leads/new">
            <Button><Plus size={16} /> Nuevo Lead</Button>
          </Link>
        }
      />

      <div className="p-8">
        <Card noPadding>
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empresa, contacto o email..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f.value ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="Sin leads"
              description={query ? 'No se encontraron resultados para tu búsqueda.' : 'Registra el primer lead para comenzar el proceso comercial.'}
              action={!query && <Link to="/leads/new"><Button><Plus size={16} /> Registrar Lead</Button></Link>}
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(lead => (
                <Link
                  key={lead.id}
                  to={`/leads/${lead.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {lead.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{lead.companyName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead.contactName} · {lead.contactEmail}</p>
                  </div>
                  <div className="hidden md:block text-xs text-gray-500 min-w-32">
                    <p>{stageLabel(lead.currentStageNumber)}</p>
                    <p className="text-gray-400 mt-0.5">{sourceLabel[lead.source] ?? lead.source}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <LeadStatusBadge status={lead.status as LeadStatus} />
                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(lead.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
