export type StageStatus = 'locked' | 'pending' | 'active' | 'complete' | 'skipped' | 'blocked';
export type PhaseNumber = 1 | 2 | 3;

export interface StageDef {
  number: number;
  id: string;
  label: string;
  phase: PhaseNumber;
  phaseLabel: string;
  description: string;
  icon: string;
  prereqs: number[];
  optional: boolean;
}

export interface WorkflowStageState {
  stageNumber: number;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  blockedAt?: string;
  blockReason?: string;
  attempts: number;
}

export interface WorkflowInstance {
  leadId: string;
  stages: Record<number, WorkflowStageState>;
}
