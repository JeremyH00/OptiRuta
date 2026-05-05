import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { PLANS, formatPrice } from '@/constants/plans';
import type { Lead, Contract } from '@/types';
import { Check } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage04PurchaseConfirmation({ lead, contract }: Props) {
  const navigate = useNavigate();
  const updateContract = useWorkflowStore(s => s.updateContract);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [selectedPlan, setSelectedPlan] = useState(contract.selectedPlan ?? '');
  const [customPrice, setCustomPrice] = useState(String(contract.agreedPrice ?? ''));
  const [startDate, setStartDate] = useState(contract.contractStartDate?.slice(0,10) ?? '');
  const [notes, setNotes] = useState(contract.commercialNotes ?? '');

  const plan = PLANS.find(p => p.tier === selectedPlan);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) { addToast('Selecciona un plan', 'error'); return; }
    if (!startDate) { addToast('Define la fecha de inicio', 'error'); return; }

    const agreedPrice = customPrice ? Number(customPrice) : plan?.monthlyPrice ?? 0;
    updateContract(lead.id, { selectedPlan: selectedPlan as Contract['selectedPlan'], agreedPrice, contractStartDate: startDate, commercialNotes: notes });
    completeStage(lead.id, 4);
    advanceStage(lead.id, 5);
    addToast('Compra confirmada', 'success');
    navigate(`/leads/${lead.id}/stage/5`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Selección de Plan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {PLANS.map(p => (
            <button
              key={p.tier}
              type="button"
              onClick={() => { setSelectedPlan(p.tier); if (p.monthlyPrice) setCustomPrice(String(p.monthlyPrice)); }}
              className={`text-left rounded-xl border-2 p-4 transition-all ${selectedPlan === p.tier ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900">{p.tier}</h4>
                {selectedPlan === p.tier && <Check size={18} className="text-brand-600" />}
              </div>
              <p className="text-brand-700 font-semibold mt-1">
                {p.monthlyPrice === 0 ? 'A convenir' : `${formatPrice(p.monthlyPrice)}/mes`}
              </p>
              <ul className="mt-3 space-y-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Check size={12} className="mt-0.5 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Precio acordado (COP / mes)"
            type="number"
            value={customPrice}
            onChange={e => setCustomPrice(e.target.value)}
            placeholder={plan?.monthlyPrice ? String(plan.monthlyPrice) : 'Precio personalizado'}
            hint="Puede diferir del precio de lista tras negociación"
          />
          <Input
            label="Fecha de inicio del contrato"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
          <Textarea label="Notas comerciales" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condiciones especiales negociadas..." className="md:col-span-2" />
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit">Confirmar Compra y Continuar</Button>
        </div>
      </Card>
    </form>
  );
}
