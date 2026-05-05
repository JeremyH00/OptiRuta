import { STAGES } from '@/constants/stages';
import type { WorkflowInstance, WorkflowStageState, StageStatus } from '@/types';

export function buildInitialWorkflow(leadId: string): WorkflowInstance {
  const stages: Record<number, WorkflowStageState> = {};
  for (const s of STAGES) {
    stages[s.number] = {
      stageNumber: s.number,
      status: s.number === 1 ? 'pending' : 'locked',
      attempts: 0,
    };
  }
  return { leadId, stages };
}

export function canAccessStage(
  workflow: WorkflowInstance,
  stageNumber: number,
  hasCoDebtor: boolean,
): boolean {
  const state = workflow.stages[stageNumber];
  if (!state) return false;

  // blocked stages are re-enterable (to fix and resubmit)
  if (state.status === 'blocked') return true;
  if (state.status === 'complete' || state.status === 'skipped') return true;
  if (state.status === 'locked') return false;

  const stageDef = STAGES.find(s => s.number === stageNumber);
  if (!stageDef) return false;

  for (const prereqNum of stageDef.prereqs) {
    // stage 9 prereq is stage 7 — and stage 10 needs BOTH 8 and 9
    if (stageNumber === 10 && prereqNum === 9) {
      const s9 = workflow.stages[9];
      const s9ok = s9.status === 'complete' || (!hasCoDebtor && s9.status === 'skipped');
      if (!s9ok) return false;
    } else {
      const prereqState = workflow.stages[prereqNum];
      if (!prereqState) return false;
      const prereqOk =
        prereqState.status === 'complete' ||
        prereqState.status === 'skipped';
      if (!prereqOk) return false;
    }
  }
  return true;
}

export function getStageStatus(workflow: WorkflowInstance, stageNumber: number): StageStatus {
  return workflow.stages[stageNumber]?.status ?? 'locked';
}

export function getActiveStageNumber(workflow: WorkflowInstance): number {
  for (let n = 1; n <= 13; n++) {
    const s = workflow.stages[n];
    if (s && (s.status === 'active' || s.status === 'pending' || s.status === 'blocked')) {
      return n;
    }
  }
  return 13;
}

export function computeEvaluationResultFromScore(total: number): 'advance' | 'followup' | 'discard' {
  if (total >= 10) return 'advance';
  if (total >= 7) return 'followup';
  return 'discard';
}

/** Apply a stage completion and unlock the next pending stages */
export function applyCompleteStage(
  workflow: WorkflowInstance,
  stageNumber: number,
  completedAt: string,
  hasCoDebtor: boolean,
): WorkflowInstance {
  const updated = deepCloneWorkflow(workflow);
  updated.stages[stageNumber] = {
    ...updated.stages[stageNumber],
    status: 'complete',
    completedAt,
  };

  // Auto-skip stage 9 if no co-debtor and we just completed stage 6
  if (stageNumber === 6 && !hasCoDebtor) {
    updated.stages[9] = {
      ...updated.stages[9],
      status: 'skipped',
      skippedAt: completedAt,
    };
  }

  // Unlock next stages whose prereqs are now met
  for (const stageDef of STAGES) {
    if (updated.stages[stageDef.number].status !== 'locked') continue;
    let allMet = true;
    for (const prereqNum of stageDef.prereqs) {
      const p = updated.stages[prereqNum];
      const ok = p.status === 'complete' || p.status === 'skipped';
      if (!ok) { allMet = false; break; }
    }
    if (allMet) {
      updated.stages[stageDef.number] = {
        ...updated.stages[stageDef.number],
        status: 'pending',
      };
    }
  }

  return updated;
}

export function applySkipStage(workflow: WorkflowInstance, stageNumber: number, skippedAt: string): WorkflowInstance {
  const updated = deepCloneWorkflow(workflow);
  updated.stages[stageNumber] = { ...updated.stages[stageNumber], status: 'skipped', skippedAt };
  return updated;
}

export function applyBlockStage(workflow: WorkflowInstance, stageNumber: number, reason: string): WorkflowInstance {
  const updated = deepCloneWorkflow(workflow);
  const prev = updated.stages[stageNumber];
  updated.stages[stageNumber] = {
    ...prev,
    status: 'blocked',
    blockedAt: new Date().toISOString(),
    blockReason: reason,
    attempts: (prev.attempts ?? 0) + 1,
  };
  return updated;
}

export function applyUnblockStage(workflow: WorkflowInstance, stageNumber: number): WorkflowInstance {
  const updated = deepCloneWorkflow(workflow);
  updated.stages[stageNumber] = { ...updated.stages[stageNumber], status: 'pending', blockedAt: undefined, blockReason: undefined };
  return updated;
}

function deepCloneWorkflow(w: WorkflowInstance): WorkflowInstance {
  return { leadId: w.leadId, stages: { ...Object.fromEntries(Object.entries(w.stages).map(([k, v]) => [k, { ...v }])) } };
}
