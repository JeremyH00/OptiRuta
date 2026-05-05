import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract } from '@/types';
import { SkipForward } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage09CoDebtorSignature({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setCoDebtorSignature = useWorkflowStore(s => s.setCoDebtorSignature);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const existingSig = contract.coDebtorSignature;
  const [method, setMethod] = useState<'physical' | 'digital'>(existingSig?.method ?? 'digital');
  const [signedAt, setSignedAt] = useState(existingSig?.signedAt?.slice(0,10) ?? new Date().toISOString().slice(0,10));
  const [signatoryName, setSignatoryName] = useState(existingSig?.signatoryName ?? contract.coDebtor?.fullName ?? '');
  const [notes, setNotes] = useState(existingSig?.notes ?? '');

  if (!contract.hasCoDebtor) {
    return (
      <Card title="Firma Codeudor — No Aplica">
        <div className="flex flex-col items-center py-10 text-center gap-3">
          <SkipForward size={32} className="text-gray-300" />
          <p className="font-medium text-gray-600">No se registró codeudor para este contrato.</p>
          <p className="text-sm text-gray-500">Esta etapa se omite automáticamente. Procede a la Validación.</p>
          <Button onClick={() => navigate(`/leads/${lead.id}/stage/10`)} className="mt-2">
            Ir a Validación
          </Button>
        </div>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signatoryName || !signedAt) { addToast('Completa los campos requeridos', 'error'); return; }

    setCoDebtorSignature(lead.id, {
      method,
      signedAt: new Date(signedAt).toISOString(),
      signatoryName,
      confirmedBy: 'Admin',
      notes,
    });
    completeStage(lead.id, 9);
    advanceStage(lead.id, 10);
    addToast('Firma del codeudor registrada', 'success');
    navigate(`/leads/${lead.id}/stage/10`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Firma del Codeudor / Aval" subtitle="Registra la firma del codeudor o aval">
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Datos del codeudor</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Nombre:</span>
              <span className="font-medium">{contract.coDebtor?.fullName ?? '—'}</span>
              <span className="text-gray-500">Documento:</span>
              <span className="font-medium">{contract.coDebtor?.idType} {contract.coDebtor?.idNumber}</span>
              <span className="text-gray-500">Relación:</span>
              <span className="font-medium">{contract.coDebtor?.relationship ?? '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del firmante *" value={signatoryName} onChange={e => setSignatoryName(e.target.value)} />
            <Select label="Método de firma *" value={method} onChange={e => setMethod(e.target.value as 'physical' | 'digital')}>
              <option value="digital">Firma digital</option>
              <option value="physical">Firma física (escaneada)</option>
            </Select>
            <Input label="Fecha de firma *" type="date" value={signedAt} onChange={e => setSignedAt(e.target.value)} />
          </div>

          <Textarea label="Notas" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones sobre el proceso de firma..." />
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit">Registrar Firma y Continuar</Button>
        </div>
      </Card>
    </form>
  );
}
