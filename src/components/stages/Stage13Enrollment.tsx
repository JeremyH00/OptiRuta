import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { PLANS, formatPrice } from '@/constants/plans';
import type { Lead, Contract } from '@/types';
import { Rocket, CheckCircle2, PartyPopper } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage13Enrollment({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setEnrollment = useWorkflowStore(s => s.setEnrollment);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const convertLead = useLeadsStore(s => s.convertLead);
  const addToast = useUIStore(s => s.addToast);

  const [csManager, setCsManager] = useState(contract.csManager ?? '');
  const [sessionDate, setSessionDate] = useState(contract.onboardingSessionDate?.slice(0,10) ?? '');
  const enrolled = contract.platformAccessGranted;

  const plan = PLANS.find(p => p.tier === contract.selectedPlan);

  function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!csManager) { addToast('Asigna un Customer Success Manager', 'error'); return; }

    setEnrollment(lead.id, csManager, sessionDate);
    completeStage(lead.id, 13);
    convertLead(lead.id);
    addToast('¡Cliente matriculado exitosamente! El proceso está completo.', 'success');
    navigate('/clients');
  }

  if (enrolled) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-10 gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <PartyPopper size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¡Cliente Activo!</h3>
          <p className="text-gray-600 max-w-xs">
            <strong>{lead.companyName}</strong> está oficialmente activo en OptiRuta. El proceso comercial y contractual está completo.
          </p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 w-full max-w-sm text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-gray-500">Plan:</span>
              <span className="font-semibold">{contract.selectedPlan}</span>
              <span className="text-gray-500">CS Manager:</span>
              <span className="font-semibold">{contract.csManager}</span>
              <span className="text-gray-500">Onboarding:</span>
              <span className="font-semibold">{contract.onboardingSessionDate ? new Date(contract.onboardingSessionDate).toLocaleDateString('es-CO') : 'Por agendar'}</span>
            </div>
          </div>
          <Button onClick={() => navigate('/clients')}>Ver Clientes Activos</Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleEnroll} className="space-y-4">
      <Card title="Matrícula del Cliente" subtitle="Último paso — activación formal en la plataforma">
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 font-semibold text-brand-800 mb-3">
            <Rocket size={18} /> Resumen de activación
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <span className="text-brand-600">Empresa:</span>
            <span className="font-semibold text-brand-900">{lead.companyName}</span>
            <span className="text-brand-600">Plan:</span>
            <span className="font-semibold text-brand-900">{contract.selectedPlan}</span>
            <span className="text-brand-600">Precio/mes:</span>
            <span className="font-semibold text-brand-900">{contract.agreedPrice ? formatPrice(contract.agreedPrice) : '—'}</span>
            <span className="text-brand-600">Método de pago:</span>
            <span className="font-semibold text-brand-900">
              {contract.paymentPlan?.method === 'credit_card' ? 'Tarjeta de crédito' :
               contract.paymentPlan?.method === 'bank_transfer' ? 'Transferencia bancaria' : 'Débito automático'}
            </span>
          </div>
        </div>

        {plan && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Accesos que se activarán:</p>
            <ul className="space-y-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Success Manager *"
            value={csManager}
            onChange={e => setCsManager(e.target.value)}
            placeholder="Laura Martínez"
          />
          <Input
            label="Fecha de sesión de onboarding"
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            min={new Date().toISOString().slice(0,10)}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit" size="lg">
            <Rocket size={18} /> Activar Cliente — Completar Proceso
          </Button>
        </div>
      </Card>
    </form>
  );
}
