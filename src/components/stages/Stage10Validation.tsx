import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract, ValidationChecklist } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage10Validation({ lead, contract }: Props) {
  const navigate = useNavigate();
  const setValidationResult = useWorkflowStore(s => s.setValidationResult);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const prev = contract.validationChecklist;
  const [checklist, setChecklist] = useState<ValidationChecklist>({
    allDocumentsPresent: prev?.allDocumentsPresent ?? false,
    allSignaturesCollected: prev?.allSignaturesCollected ?? false,
    partyInfoCorrect: prev?.partyInfoCorrect ?? false,
    planDetailsCorrect: prev?.planDetailsCorrect ?? false,
    paymentTermsCorrect: prev?.paymentTermsCorrect ?? false,
  });
  const [notes, setNotes] = useState(contract.validationNotes ?? '');

  const allChecked = Object.values(checklist).every(Boolean);
  const attempts = contract.validationAttempts;

  function toggle(key: keyof ValidationChecklist) {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(passed: boolean) {
    setValidationResult(lead.id, checklist, notes, passed);
    if (passed) {
      completeStage(lead.id, 10);
      advanceStage(lead.id, 11);
      addToast('Validación exitosa', 'success');
      navigate(`/leads/${lead.id}/stage/11`);
    } else {
      addToast('Validación rechazada — revisa los puntos observados', 'error');
    }
  }

  const checkItems: { key: keyof ValidationChecklist; label: string; desc: string }[] = [
    { key: 'allDocumentsPresent', label: 'Todos los documentos están presentes', desc: 'Contrato, SLA, política de datos y adendo codeudor (si aplica)' },
    { key: 'allSignaturesCollected', label: 'Todas las firmas requeridas están recopiladas', desc: 'Firma del titular y codeudor (si aplica), métodos válidos' },
    { key: 'partyInfoCorrect', label: 'Información de las partes es correcta', desc: 'Nombres, documentos, emails y direcciones verificados' },
    { key: 'planDetailsCorrect', label: 'Detalles del plan y precio son correctos', desc: 'Plan seleccionado, precio acordado y fecha de inicio' },
    { key: 'paymentTermsCorrect', label: 'Condiciones de pago están definidas', desc: 'Ciclo de facturación y condiciones comerciales claras' },
  ];

  return (
    <div className="space-y-4">
      {attempts > 0 && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Intento {attempts} de validación</p>
            {contract.lastValidationRejectionReason && (
              <p className="mt-0.5">Motivo del rechazo anterior: {contract.lastValidationRejectionReason}</p>
            )}
          </div>
        </div>
      )}

      <Card title="Lista de Verificación" subtitle="Marca todos los puntos antes de enviar">
        <div className="space-y-4">
          {checkItems.map(item => (
            <div key={item.key} className={`rounded-lg border p-4 transition-colors ${checklist[item.key] ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <Checkbox
                label={item.label}
                checked={checklist[item.key]}
                onChange={() => toggle(item.key)}
              />
              <p className="text-xs text-gray-500 ml-6 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <Textarea
          label="Notas de validación"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observaciones del área legal / administrativo..."
          className="mt-4"
        />

        <div className="mt-5 flex gap-3 justify-end">
          <Button variant="danger" onClick={() => handleSubmit(false)}>
            Rechazar (documentación incompleta)
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={!allChecked}>
            Aprobar Validación
          </Button>
        </div>
      </Card>
    </div>
  );
}
