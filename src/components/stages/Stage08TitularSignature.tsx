import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract } from '@/types';
import { PenLine, CheckCircle2 } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage08TitularSignature({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setTitularSignature = useWorkflowStore(s => s.setTitularSignature);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const existingSig = contract.titularSignature;
  const [method, setMethod] = useState<'physical' | 'digital'>(existingSig?.method ?? 'digital');
  const [signedAt, setSignedAt] = useState(existingSig?.signedAt?.slice(0,10) ?? new Date().toISOString().slice(0,10));
  const [signatoryName, setSignatoryName] = useState(existingSig?.signatoryName ?? contract.titular?.fullName ?? '');
  const [notes, setNotes] = useState(existingSig?.notes ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signatoryName || !signedAt) { addToast('Completa los campos requeridos', 'error'); return; }

    setTitularSignature(lead.id, {
      method,
      signedAt: new Date(signedAt).toISOString(),
      signatoryName,
      confirmedBy: 'Admin',
      notes,
    });
    completeStage(lead.id, 8);
    advanceStage(lead.id, contract.hasCoDebtor ? 9 : 10);
    addToast('Firma del titular registrada', 'success');
    navigate(`/leads/${lead.id}/stage/${contract.hasCoDebtor ? 9 : 10}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Firma del Titular" subtitle="Registra la firma del representante legal del cliente">
        {existingSig && (
          <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={16} /> Firma registrada previamente — puede actualizar los datos si es necesario.
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del firmante *"
              value={signatoryName}
              onChange={e => setSignatoryName(e.target.value)}
              placeholder={contract.titular?.fullName}
            />
            <Select label="Método de firma *" value={method} onChange={e => setMethod(e.target.value as 'physical' | 'digital')}>
              <option value="digital">Firma digital (plataforma electrónica)</option>
              <option value="physical">Firma física (escaneada)</option>
            </Select>
            <Input
              label="Fecha de firma *"
              type="date"
              value={signedAt}
              onChange={e => setSignedAt(e.target.value)}
            />
          </div>

          {method === 'physical' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              <strong>Firma física:</strong> asegúrate de escanear el documento firmado y adjuntarlo al expediente físico antes de continuar.
            </div>
          )}
          {method === 'digital' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
              <strong>Firma digital:</strong> confirma que el cliente haya completado la firma en la plataforma de firma electrónica (e.g., DocuSign, Hellosign).
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5"><PenLine size={13} /> Datos del titular</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Nombre:</span>
              <span className="font-medium">{contract.titular?.fullName ?? '—'}</span>
              <span className="text-gray-500">Documento:</span>
              <span className="font-medium">{contract.titular?.idType} {contract.titular?.idNumber}</span>
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{contract.titular?.email ?? '—'}</span>
            </div>
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
