import type { JSX } from 'react';
import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StageTimeline } from '@/components/workflow/StageTimeline';
import { StageShell } from '@/components/stages/StageShell';
import { Stage01LeadRegistration } from '@/components/stages/Stage01LeadRegistration';
import { Stage02Evaluation } from '@/components/stages/Stage02Evaluation';
import { Stage03EvaluationResult } from '@/components/stages/Stage03EvaluationResult';
import { Stage04PurchaseConfirmation } from '@/components/stages/Stage04PurchaseConfirmation';
import { Stage05ContractualProcess } from '@/components/stages/Stage05ContractualProcess';
import { Stage06PartyRegistration } from '@/components/stages/Stage06PartyRegistration';
import { Stage07DocumentGeneration } from '@/components/stages/Stage07DocumentGeneration';
import { Stage08TitularSignature } from '@/components/stages/Stage08TitularSignature';
import { Stage09CoDebtorSignature } from '@/components/stages/Stage09CoDebtorSignature';
import { Stage10Validation } from '@/components/stages/Stage10Validation';
import { Stage11Approval } from '@/components/stages/Stage11Approval';
import { Stage12PaymentPlan } from '@/components/stages/Stage12PaymentPlan';
import { Stage13Enrollment } from '@/components/stages/Stage13Enrollment';
import { LeadStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { STAGES } from '@/constants/stages';
import { getActiveStageNumber } from '@/lib/stageEngine';
import type { Lead, Contract } from '@/types';
import { RefreshCw, Trash2 } from 'lucide-react';

type StageComponentFn = (props: { lead: Lead; contract: Contract }) => JSX.Element;

const STAGE_COMPONENTS: Record<number, StageComponentFn> = {
  2: ({ lead }) => <Stage02Evaluation lead={lead} />,
  3: ({ lead }) => <Stage03EvaluationResult lead={lead} />,
  4: ({ lead, contract }) => <Stage04PurchaseConfirmation lead={lead} contract={contract} />,
  5: ({ lead, contract }) => <Stage05ContractualProcess lead={lead} contract={contract} />,
  6: ({ lead, contract }) => <Stage06PartyRegistration lead={lead} contract={contract} />,
  7: ({ lead, contract }) => <Stage07DocumentGeneration lead={lead} contract={contract} />,
  8: ({ lead, contract }) => <Stage08TitularSignature lead={lead} contract={contract} />,
  9: ({ lead, contract }) => <Stage09CoDebtorSignature lead={lead} contract={contract} />,
  10: ({ lead, contract }) => <Stage10Validation lead={lead} contract={contract} />,
  11: ({ lead, contract }) => <Stage11Approval lead={lead} contract={contract} />,
  12: ({ lead, contract }) => <Stage12PaymentPlan lead={lead} contract={contract} />,
  13: ({ lead, contract }) => <Stage13Enrollment lead={lead} contract={contract} />,
};

export function LeadDetailPage() {
  const { leadId, stageNum } = useParams<{ leadId: string; stageNum?: string }>();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  const lead = useLeadsStore(s => s.getLeadById(leadId ?? ''));
  const reactivateLead = useLeadsStore(s => s.reactivateLead);
  const deleteLead = useLeadsStore(s => s.deleteLead);
  const workflow = useWorkflowStore(s => s.getWorkflow(leadId ?? ''));
  const contract = useWorkflowStore(s => s.getContract(leadId ?? ''));
  const reactivateWorkflow = useWorkflowStore(s => s.reactivateWorkflow);
  const deleteWorkflow = useWorkflowStore(s => s.deleteWorkflow);
  const stageStatus = useWorkflowStore(s => s.stageStatus);
  const addToast = useUIStore(s => s.addToast);

  if (!lead || !workflow || !contract) return <Navigate to="/leads" />;

  const safeLead = lead;

  const activeStageInWorkflow = getActiveStageNumber(workflow);
  const currentStageNum = stageNum ? Number(stageNum) : activeStageInWorkflow;

  if (stageNum && isNaN(currentStageNum)) return <Navigate to={`/leads/${leadId}`} />;

  const stageDef = STAGES.find(s => s.number === currentStageNum);
  const status = stageStatus(lead.id, currentStageNum);

  const StageComponent = currentStageNum === 1
    ? () => <Stage01LeadRegistration lead={lead} />
    : STAGE_COMPONENTS[currentStageNum];

  const canReactivate = lead.status === 'paused' || lead.status === 'discarded';

  function handleReactivate() {
    reactivateLead(safeLead.id);
    reactivateWorkflow(safeLead.id);
    addToast('Lead reactivado correctamente.', 'success');
    setShowReactivateModal(false);
  }

  function handleDelete() {
    deleteLead(safeLead.id);
    deleteWorkflow(safeLead.id);
    addToast('Lead eliminado.', 'info');
    navigate('/leads');
  }

  return (
    <div>
      <PageHeader
        title={lead.companyName}
        subtitle={`${lead.contactName} · ${lead.contactEmail}`}
        back
        action={
          <div className="flex items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            {canReactivate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReactivateModal(true)}
                icon={<RefreshCw size={14} />}
              >
                Reactivar
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 size={14} />}
            >
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="flex h-[calc(100vh-81px)]">
        {/* Left panel — Stage Timeline */}
        <div className="w-72 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4">
          <StageTimeline leadId={lead.id} workflow={workflow} activeStage={currentStageNum} />
        </div>

        {/* Right panel — Active stage form */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            {stageDef && (
              <StageShell
                stageNumber={currentStageNum}
                stageLabel={stageDef.label}
                description={stageDef.description}
                status={status}
              >
                {StageComponent ? (
                  <StageComponent lead={lead} contract={contract} />
                ) : (
                  <p className="text-sm text-gray-500">Componente no disponible.</p>
                )}
              </StageShell>
            )}
          </div>
        </div>
      </div>

      {/* Reactivate confirmation modal */}
      <Modal
        open={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        title="Reactivar lead"
      >
        <p className="text-sm text-gray-600 mb-6">
          ¿Reactivar a <strong>{lead.companyName}</strong>? El lead volverá a estado activo y podrá continuar el proceso desde la evaluación.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowReactivateModal(false)}>Cancelar</Button>
          <Button variant="primary" icon={<RefreshCw size={14} />} onClick={handleReactivate}>
            Reactivar
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar lead"
      >
        <p className="text-sm text-gray-600 mb-6">
          ¿Eliminar permanentemente a <strong>{lead.companyName}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
