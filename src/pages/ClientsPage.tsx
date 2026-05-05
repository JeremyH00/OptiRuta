import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { PLANS, formatPrice } from '@/constants/plans';
import { formatDate } from '@/lib/dateUtils';
import { UserCheck, CreditCard, CalendarCheck2 } from 'lucide-react';

const METHOD_LABEL: Record<string, string> = {
  credit_card: 'Tarjeta de crédito',
  bank_transfer: 'Transferencia bancaria',
  auto_debit: 'Débito automático',
};

export function ClientsPage() {
  const leads = useLeadsStore(s => s.leads);
  const contracts = useWorkflowStore(s => s.contracts);

  const clients = leads.filter(l => l.status === 'converted');

  return (
    <div>
      <PageHeader
        title="Clientes Activos"
        subtitle={`${clients.length} cliente${clients.length !== 1 ? 's' : ''} activo${clients.length !== 1 ? 's' : ''}`}
      />

      <div className="p-8">
        {clients.length === 0 ? (
          <EmptyState
            icon={<UserCheck size={40} />}
            title="Sin clientes activos aún"
            description="Los leads que completen las 13 etapas aparecerán aquí."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map(client => {
              const contract = contracts[client.id];
              const plan = PLANS.find(p => p.tier === contract?.selectedPlan);

              return (
                <Link key={client.id} to={`/leads/${client.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {client.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{client.companyName}</h3>
                        <p className="text-sm text-gray-500">{client.contactName}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Activo
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard size={14} className="text-gray-400" />
                        <span>{contract?.selectedPlan ?? '—'}</span>
                        {contract?.agreedPrice && (
                          <span className="font-semibold text-brand-700">{formatPrice(contract.agreedPrice)}/mes</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarCheck2 size={14} className="text-gray-400" />
                        <span>Matriculado {contract?.enrollmentDate ? formatDate(contract.enrollmentDate) : '—'}</span>
                      </div>
                      {contract?.paymentPlan && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <span>{METHOD_LABEL[contract.paymentPlan.method]}</span>
                          {contract.paymentPlan.cardLast4 && <span>· ···· {contract.paymentPlan.cardLast4}</span>}
                        </div>
                      )}
                    </div>

                    {plan && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">CS Manager: {contract?.csManager ?? '—'}</p>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
