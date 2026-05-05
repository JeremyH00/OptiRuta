import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ClipboardList, CheckCircle2, ShoppingCart, FileText, Users,
  FileOutput, PenLine, ClipboardCheck, BadgeCheck, CreditCard, Rocket,
  Lock, CheckCircle, AlertCircle, SkipForward, Clock,
} from 'lucide-react';
import type { WorkflowInstance, StageDef, StageStatus } from '@/types';
import { STAGES, PHASE_COLORS } from '@/constants/stages';
import { formatDate } from '@/lib/dateUtils';

const ICON_MAP: Record<string, ElementType> = {
  UserPlus, ClipboardList, CheckCircle2, ShoppingCart, FileText, Users,
  FileOutput, PenLine, ClipboardCheck, BadgeCheck, CreditCard, Rocket,
};

function StageIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? Clock;
  return <Icon size={16} />;
}

function statusIcon(status: StageStatus) {
  if (status === 'complete') return <CheckCircle size={16} className="text-green-500" />;
  if (status === 'blocked') return <AlertCircle size={16} className="text-red-500" />;
  if (status === 'skipped') return <SkipForward size={16} className="text-gray-400" />;
  if (status === 'locked') return <Lock size={14} className="text-gray-300" />;
  return null;
}

function statusStyle(status: StageStatus): string {
  if (status === 'complete') return 'border-green-200 bg-green-50';
  if (status === 'active' || status === 'pending') return 'border-blue-200 bg-blue-50';
  if (status === 'blocked') return 'border-red-200 bg-red-50';
  if (status === 'skipped') return 'border-gray-100 bg-gray-50 opacity-60';
  return 'border-gray-100 bg-white opacity-50';
}

function iconBg(status: StageStatus): string {
  if (status === 'complete') return 'bg-green-500 text-white';
  if (status === 'active' || status === 'pending') return 'bg-brand-600 text-white';
  if (status === 'blocked') return 'bg-red-500 text-white';
  if (status === 'skipped') return 'bg-gray-300 text-white';
  return 'bg-gray-200 text-gray-400';
}

interface Props {
  leadId: string;
  workflow: WorkflowInstance;
  activeStage: number;
}

const PHASES = [1, 2, 3] as const;
const phaseStages = (phase: number) => STAGES.filter(s => s.phase === phase);

export function StageTimeline({ leadId, workflow, activeStage }: Props) {
  const navigate = useNavigate();

  const completedCount = Object.values(workflow.stages).filter(
    s => s.status === 'complete' || s.status === 'skipped',
  ).length;
  const progressPct = Math.round((completedCount / 13) * 100);

  function handleClick(stage: StageDef, status: StageStatus) {
    if (status === 'locked') return;
    navigate(`/leads/${leadId}/stage/${stage.number}`);
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="mb-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium">Progreso</span>
          <span className="font-bold text-brand-700">{completedCount}/13 etapas · {progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      {PHASES.map(phase => (
        <div key={phase}>
          <div className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg mb-2 ${PHASE_COLORS[phase]}`}>
            Fase {phase}: {phase === 1 ? 'Comercial' : phase === 2 ? 'Contractual' : 'Operativo'}
          </div>
          <div className="space-y-1.5">
            {phaseStages(phase).map(stage => {
              const stageState = workflow.stages[stage.number];
              const status: StageStatus = stageState?.status ?? 'locked';
              const isActive = stage.number === activeStage;

              return (
                <button
                  key={stage.number}
                  onClick={() => handleClick(stage, status)}
                  disabled={status === 'locked'}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                    ${statusStyle(status)}
                    ${isActive ? 'ring-2 ring-brand-500 ring-offset-1' : ''}
                    ${status !== 'locked' ? 'hover:shadow-sm cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${iconBg(status)}`}>
                    {status === 'complete' ? <CheckCircle size={14} /> :
                     status === 'blocked' ? <AlertCircle size={14} /> :
                     status === 'skipped' ? <SkipForward size={12} /> :
                     status === 'locked' ? <Lock size={12} /> :
                     <StageIcon name={stage.icon} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${status === 'locked' ? 'text-gray-400' : status === 'complete' ? 'text-green-700' : status === 'blocked' ? 'text-red-700' : 'text-gray-800'}`}>
                        {stage.number}. {stage.label}
                      </p>
                      {statusIcon(status)}
                    </div>
                    {stageState?.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(stageState.completedAt)}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
