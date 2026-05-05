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
import { BadgeCheck, XCircle } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage11Approval({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setApproval = useWorkflowStore(s => s.setApproval);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [approver, setApprover] = useState(contract.approvedBy ?? '');
  const [role, setRole] = useState('Legal');
  const [notes, setNotes] = useState(contract.approvalNotes ?? '');

  const plan = PLANS.find(p => p.tier === contract.selectedPlan);

  function handleDecision(approved: boolean) {
    if (!approver) { addToast('Ingresa el nombre del aprobador', 'error'); return; }
    setApproval(lead.id, `${approver} (${role})`, notes, approved);
    if (approved) {
      completeStage(lead.id, 11);
      advanceStage(lead.id, 12);
      addToast('Vinculación aprobada', 'success');
      navigate(`/leads/${lead.id}/stage/12`);
    } else {
      addToast('Vinculación rechazada', 'error');
    }
  }

  const summary = [
    { label: 'Empresa', value: lead.companyName },
    { label: 'Contacto', value: lead.contactName },
    { label: 'Plan', value: contract.selectedPlan ?? '—' },
    { label: 'Precio mensual', value: contract.agreedPrice ? formatPrice(contract.agreedPrice) : '—' },
    { label: 'Titular', value: contract.titular?.fullName ?? '—' },
    { label: 'Codeudor', value: contract.hasCoDebtor ? (contract.coDebtor?.fullName ?? '—') : 'N/A' },
    { label: 'Firma titular', value: contract.titularSignature ? `${contract.titularSignature.method === 'digital' ? 'Digital' : 'Física'} — ${new Date(contract.titularSignature.signedAt).toLocaleDateString('es-CO')}` : '—' },
    { label: 'Validaciones', value: `${contract.validationAttempts} intento(s)` },
  ];

  return (
    <div className="space-y-4">
      <Card title="Resumen del Expediente">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {summary.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {plan && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Características del plan {plan.tier}:</p>
            <ul className="space-y-1">
              {plan.features.map(f => <li key={f} className="text-sm text-gray-700">• {f}</li>)}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Decisión de Aprobación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Nombre del aprobador *" value={approver} onChange={e => setApprover(e.target.value)} placeholder="María Rodríguez" />
          <Select label="Área" value={role} onChange={e => setRole(e.target.value)}>
            <option>Legal</option>
            <option>Comercial</option>
            <option>Dirección</option>
            <option>Administrativo</option>
          </Select>
        </div>
        <Textarea label="Notas de aprobación" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Comentarios sobre la vinculación..." className="mb-5" />

        <div className="flex gap-3">
          <Button variant="success" onClick={() => handleDecision(true)}>
            <BadgeCheck size={16} /> Aprobar vinculación
          </Button>
          <Button variant="danger" onClick={() => handleDecision(false)}>
            <XCircle size={16} /> Rechazar vinculación
          </Button>
        </div>
      </Card>
    </div>
  );
}
