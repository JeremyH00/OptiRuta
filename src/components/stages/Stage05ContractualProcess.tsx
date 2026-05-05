import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract } from '@/types';
import { FileText, Shield, Handshake } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage05ContractualProcess({ lead, contract }: Props) {
  const navigate = useNavigate();
  const updateContract = useWorkflowStore(s => s.updateContract);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [slaAccepted, setSlaAccepted] = useState(contract.slaAccepted ?? false);
  const [dataProtAccepted, setDataProtAccepted] = useState(contract.dataProtectionAccepted ?? false);
  const [notes, setNotes] = useState(contract.contractNotes ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slaAccepted || !dataProtAccepted) {
      addToast('Debes aceptar el SLA y la política de datos', 'error');
      return;
    }
    updateContract(lead.id, { slaAccepted, dataProtectionAccepted: dataProtAccepted, contractNotes: notes });
    completeStage(lead.id, 5);
    advanceStage(lead.id, 6);
    addToast('Proceso contractual completado', 'success');
    navigate(`/leads/${lead.id}/stage/6`);
  }

  const planTier = contract.selectedPlan ?? 'Pro';
  const slaDetails = planTier === 'Enterprise' ? '99.9%' : planTier === 'Pro' ? '99.5%' : '99.0%';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Documentos Contractuales">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
              <FileText size={18} className="text-brand-600" /> Contrato de Servicio
            </div>
            <p className="text-sm text-gray-600">
              Contrato de prestación de servicios del Sistema Inteligente de Rutas de Entrega OptiRuta,
              Plan <strong>{planTier}</strong>. Duración inicial 12 meses con renovación automática.
              Precio acordado: facturación recurrente según ciclo pactado.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
              <Handshake size={18} className="text-purple-600" /> Acuerdo de Niveles de Servicio (SLA)
            </div>
            <p className="text-sm text-gray-600">
              Disponibilidad garantizada <strong>{slaDetails}</strong> mensual. Tiempos de respuesta soporte
              según plan contratado. Compensaciones por incumplimiento definidas en Anexo A.
            </p>
            <Checkbox
              label="He revisado y acepto los términos del SLA"
              checked={slaAccepted}
              onChange={e => setSlaAccepted(e.target.checked)}
              className="mt-3"
            />
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
              <Shield size={18} className="text-green-600" /> Política de Protección de Datos (Ley 1581/2012)
            </div>
            <p className="text-sm text-gray-600">
              Tratamiento de datos personales conforme a la normativa colombiana vigente.
              OptiRuta actúa como responsable del tratamiento. Derechos del titular garantizados.
            </p>
            <Checkbox
              label="He revisado y acepto la política de protección de datos"
              checked={dataProtAccepted}
              onChange={e => setDataProtAccepted(e.target.checked)}
              className="mt-3"
            />
          </div>

          <Textarea
            label="Notas del proceso contractual"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones, condiciones especiales, cláusulas adicionales..."
          />
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit">Confirmar y Continuar</Button>
        </div>
      </Card>
    </form>
  );
}
