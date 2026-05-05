import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract, PaymentMethod, BillingCycle } from '@/types';
import { CreditCard, Building2, RefreshCw } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage12PaymentPlan({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setPaymentPlan = useWorkflowStore(s => s.setPaymentPlan);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const prev = contract.paymentPlan;
  const [method, setMethod] = useState<PaymentMethod>(prev?.method ?? 'credit_card');
  const [cycle, setCycle] = useState<BillingCycle>(prev?.billingCycle ?? 'monthly');
  const [startDate, setStartDate] = useState(prev?.startDate?.slice(0,10) ?? contract.contractStartDate?.slice(0,10) ?? '');
  const [bankName, setBankName] = useState(prev?.bankName ?? '');
  const [last4, setLast4] = useState(prev?.cardLast4 ?? prev?.accountLast4 ?? '');
  const [notes, setNotes] = useState(prev?.notes ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) { addToast('Define la fecha de inicio de facturación', 'error'); return; }

    setPaymentPlan(lead.id, {
      method,
      billingCycle: cycle,
      startDate: new Date(startDate).toISOString(),
      bankName: method !== 'credit_card' ? bankName : undefined,
      cardLast4: method === 'credit_card' ? last4 : undefined,
      accountLast4: method !== 'credit_card' ? last4 : undefined,
      notes,
    });
    completeStage(lead.id, 12);
    advanceStage(lead.id, 13);
    addToast('Plan de pagos activado', 'success');
    navigate(`/leads/${lead.id}/stage/13`);
  }

  const methodConfig = {
    credit_card: { icon: CreditCard, label: 'Tarjeta de crédito', color: 'text-blue-600' },
    bank_transfer: { icon: Building2, label: 'Transferencia bancaria', color: 'text-purple-600' },
    auto_debit: { icon: RefreshCw, label: 'Débito automático', color: 'text-green-600' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Configuración de Pagos">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {(Object.entries(methodConfig) as [PaymentMethod, typeof methodConfig.credit_card][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${method === key ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
              >
                <Icon size={22} className={method === key ? 'text-brand-600' : 'text-gray-400'} />
                <span className="text-xs font-medium text-center text-gray-700">{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Ciclo de facturación" value={cycle} onChange={e => setCycle(e.target.value as BillingCycle)}>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="annual">Anual</option>
          </Select>
          <Input label="Fecha de inicio de facturación *" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

          {method !== 'credit_card' && (
            <Input label="Banco" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bancolombia, Davivienda..." />
          )}

          <Input
            label={method === 'credit_card' ? 'Últimos 4 dígitos de la tarjeta' : 'Últimos 4 dígitos de la cuenta'}
            value={last4}
            onChange={e => setLast4(e.target.value.slice(0, 4))}
            maxLength={4}
            placeholder="XXXX"
            hint="Solo para referencia — no almacenar datos completos"
          />

          <Textarea label="Notas" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones de pago, referencias..." className="md:col-span-2" />
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit">Activar Plan de Pagos</Button>
        </div>
      </Card>
    </form>
  );
}
