import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { computeEvaluationResultFromScore } from '@/lib/stageEngine';
import type { Lead, EvaluationScore } from '@/types';

interface Props { lead: Lead }

const scoreOptions = [
  { value: '1', label: '1 – Bajo' },
  { value: '2', label: '2 – Medio' },
  { value: '3', label: '3 – Alto' },
];

export function Stage02Evaluation({ lead }: Props) {
  const setEvaluationScore = useLeadsStore(s => s.setEvaluationScore);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const prev = lead.evaluationScore;
  const [scores, setScores] = useState({
    companySize: String(prev?.companySize ?? '1'),
    dailyDeliveries: String(prev?.dailyDeliveries ?? '1'),
    urgency: String(prev?.urgency ?? '1'),
    paymentCapacity: String(prev?.paymentCapacity ?? '1'),
  });
  const [notes, setNotes] = useState(lead.evaluationNotes ?? '');

  const total = Number(scores.companySize) + Number(scores.dailyDeliveries) + Number(scores.urgency) + Number(scores.paymentCapacity);
  const recommendation = computeEvaluationResultFromScore(total);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const score: EvaluationScore = {
      companySize: Number(scores.companySize) as 1|2|3,
      dailyDeliveries: Number(scores.dailyDeliveries) as 1|2|3,
      urgency: Number(scores.urgency) as 1|2|3,
      paymentCapacity: Number(scores.paymentCapacity) as 1|2|3,
      total,
    };
    setEvaluationScore(lead.id, score, notes);
    completeStage(lead.id, 2);
    advanceStage(lead.id, 3);
    addToast('Evaluación guardada', 'success');
  }

  const recColor = recommendation === 'advance' ? 'text-green-700 bg-green-50 border-green-200' :
    recommendation === 'followup' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
    'text-red-700 bg-red-50 border-red-200';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Criterios de Calificación" subtitle="Puntúa cada dimensión del 1 (bajo) al 3 (alto)">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Tamaño de la empresa" value={scores.companySize} onChange={e => setScores(s => ({...s, companySize: e.target.value}))}>
              <option value="1">1 – Pequeña (1-9 vehículos)</option>
              <option value="2">2 – Mediana (10-50 vehículos)</option>
              <option value="3">3 – Grande (+50 vehículos)</option>
            </Select>
            <Select label="Volumen de entregas diarias" value={scores.dailyDeliveries} onChange={e => setScores(s => ({...s, dailyDeliveries: e.target.value}))}>
              <option value="1">1 – Bajo (&lt;50 entregas/día)</option>
              <option value="2">2 – Medio (50-200 entregas/día)</option>
              <option value="3">3 – Alto (+200 entregas/día)</option>
            </Select>
            <Select label="Urgencia de la necesidad" value={scores.urgency} onChange={e => setScores(s => ({...s, urgency: e.target.value}))}>
              <option value="1">1 – Baja (solo explorando)</option>
              <option value="2">2 – Media (interesado)</option>
              <option value="3">3 – Alta (necesidad inmediata)</option>
            </Select>
            <Select label="Capacidad de pago" value={scores.paymentCapacity} onChange={e => setScores(s => ({...s, paymentCapacity: e.target.value}))}>
              <option value="1">1 – Baja (presupuesto ajustado)</option>
              <option value="2">2 – Media (presupuesto disponible)</option>
              <option value="3">3 – Alta (sin restricción presupuestal)</option>
            </Select>
          </div>

          <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${recColor}`}>
            <div>
              <p className="font-semibold text-sm">Puntaje total: {total} / 12</p>
              <p className="text-xs mt-0.5">
                Recomendación automática: <strong>{recommendation === 'advance' ? 'Avanzar' : recommendation === 'followup' ? 'Seguimiento' : 'Descartar'}</strong>
              </p>
            </div>
            <div className="text-2xl font-bold">{total}</div>
          </div>

          <Textarea label="Notas del líder comercial" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones, contexto adicional, próximos pasos..." />
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit">Guardar Evaluación</Button>
        </div>
      </Card>
    </form>
  );
}
