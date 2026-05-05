import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea, Input } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { computeEvaluationResultFromScore } from '@/lib/stageEngine';
import type { Lead } from '@/types';
import { CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';

interface Props { lead: Lead }

export function Stage03EvaluationResult({ lead }: Props) {
  const navigate = useNavigate();
  const setEvaluationResult = useLeadsStore(s => s.setEvaluationResult);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const score = lead.evaluationScore;
  const recommendation = score ? computeEvaluationResultFromScore(score.total) : 'followup';

  const [notes, setNotes] = useState(lead.evaluationResultNotes ?? '');
  const [followupDate, setFollowupDate] = useState(lead.followupDate?.slice(0, 10) ?? '');
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleAdvance() {
    setSubmitting(true);
    setEvaluationResult(lead.id, 'advance', notes);
    completeStage(lead.id, 3);
    advanceStage(lead.id, 4);
    addToast('Lead calificado — avanzando a proceso de compra', 'success');
    navigate(`/leads/${lead.id}/stage/4`);
  }

  function handleFollowup() {
    if (!followupDate) { addToast('Selecciona una fecha de seguimiento', 'error'); return; }
    setEvaluationResult(lead.id, 'followup', notes, followupDate);
    completeStage(lead.id, 3);
    addToast('Lead marcado para seguimiento', 'info');
    navigate(`/leads`);
  }

  function handleDiscard() {
    setEvaluationResult(lead.id, 'discard', notes);
    completeStage(lead.id, 3);
    addToast('Lead descartado', 'info');
    navigate('/leads');
  }

  const scoreItems = score ? [
    { label: 'Tamaño empresa', value: score.companySize },
    { label: 'Entregas diarias', value: score.dailyDeliveries },
    { label: 'Urgencia', value: score.urgency },
    { label: 'Capacidad de pago', value: score.paymentCapacity },
  ] : [];

  return (
    <div className="space-y-4">
      {score && (
        <Card title="Resultado de Evaluación">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {scoreItems.map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-brand-700 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-brand-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-brand-800">Puntaje total</p>
              <p className="text-xs text-brand-600">Umbral: 10–12 Avanzar · 7–9 Seguimiento · 4–6 Descartar</p>
            </div>
            <p className="text-3xl font-bold text-brand-700">{score.total}<span className="text-sm font-normal text-brand-400">/12</span></p>
          </div>
          {lead.evaluationNotes && (
            <div className="mt-3 bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Notas de evaluación:</p>
              <p className="text-sm text-gray-700">{lead.evaluationNotes}</p>
            </div>
          )}
        </Card>
      )}

      <Card title="Decisión del Líder Comercial">
        <Textarea
          label="Notas de la decisión"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Justifica la decisión tomada..."
          className="mb-4"
        />

        <div
          className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-2
            ${recommendation === 'advance' ? 'border-green-200 bg-green-50 text-green-800' :
              recommendation === 'followup' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
              'border-red-200 bg-red-50 text-red-800'}`}
        >
          <TrendingUp size={16} />
          Recomendación automática: <strong className="ml-1">{recommendation === 'advance' ? 'Avanzar' : recommendation === 'followup' ? 'Seguimiento' : 'Descartar'}</strong>
        </div>

        {/* Follow-up date */}
        <div className="mb-5">
          <Input
            label="Fecha de seguimiento (si aplica)"
            type="date"
            value={followupDate}
            onChange={e => setFollowupDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="success" onClick={handleAdvance} loading={submitting}>
            <CheckCircle2 size={16} /> Avanzar al proceso de compra
          </Button>
          <Button variant="secondary" onClick={handleFollowup}>
            <Clock size={16} /> Poner en seguimiento
          </Button>
          <Button variant="danger" onClick={() => setDiscardConfirmOpen(true)}>
            <XCircle size={16} /> Descartar lead
          </Button>
        </div>
      </Card>

      <Modal
        open={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        title="Confirmar descarte"
      >
        <p className="text-sm text-gray-600 mb-4">¿Estás seguro de que deseas descartar este lead? Esta acción cerrará el proceso comercial.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDiscardConfirmOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDiscard}>Descartar</Button>
        </div>
      </Modal>
    </div>
  );
}
