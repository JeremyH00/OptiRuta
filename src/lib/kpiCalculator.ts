import type { Lead, Contract, WorkflowInstance, KPISnapshot, StageMetrics } from '@/types';
import { STAGES } from '@/constants/stages';
import { diffDays } from './dateUtils';

export function computeKPIs(
  leads: Lead[],
  contracts: Record<string, Contract>,
  workflows: Record<string, WorkflowInstance>,
): KPISnapshot {
  const totalLeads = leads.length;
  const activeClients = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? activeClients / totalLeads : 0;

  // Average cycle time
  const convertedLeads = leads.filter(l => l.status === 'converted');
  const cycleTimes = convertedLeads.map(l => {
    const wf = workflows[l.id];
    const s13 = wf?.stages[13];
    if (!s13?.completedAt) return null;
    return diffDays(l.createdAt, s13.completedAt);
  }).filter((v): v is number => v !== null);
  const avgCycleDays = cycleTimes.length > 0 ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) : 0;

  // Validation rejection %
  const reachedValidation = Object.values(contracts).filter(c => {
    const wf = workflows[c.leadId];
    const s10 = wf?.stages[10];
    return s10 && s10.status !== 'locked';
  });
  const rejected = reachedValidation.filter(c => c.validationAttempts > 1);
  const validationRejectionPct = reachedValidation.length > 0 ? rejected.length / reachedValidation.length : 0;

  // Total reprocessing
  const totalReprocessingCount = Object.values(contracts).reduce((acc, c) => acc + Math.max(0, c.validationAttempts - 1), 0);

  // Average signing time (stage 7 complete → stage 9 complete or stage 8 if no co-debtor)
  const signingTimes: number[] = [];
  for (const wf of Object.values(workflows)) {
    const s7 = wf.stages[7];
    const s8 = wf.stages[8];
    const s9 = wf.stages[9];
    if (!s7?.completedAt) continue;
    let signEndDate: string | undefined;
    if (s9?.status === 'complete' && s9.completedAt) {
      signEndDate = s9.completedAt > (s8?.completedAt ?? '') ? s9.completedAt : (s8?.completedAt ?? s9.completedAt);
    } else if (s8?.completedAt && s9?.status === 'skipped') {
      signEndDate = s8.completedAt;
    }
    if (signEndDate) {
      signingTimes.push(diffDays(s7.completedAt, signEndDate));
    }
  }
  const avgSigningDays = signingTimes.length > 0
    ? Math.round((signingTimes.reduce((a, b) => a + b, 0) / signingTimes.length) * 10) / 10
    : 0;

  const stageMetrics = computeStageMetrics(leads, workflows);

  return {
    computedAt: new Date().toISOString(),
    totalLeads,
    activeClients,
    conversionRate,
    avgCycleDays,
    validationRejectionPct,
    totalReprocessingCount,
    avgSigningDays,
    stageMetrics,
  };
}

function computeStageMetrics(leads: Lead[], workflows: Record<string, WorkflowInstance>): StageMetrics[] {
  return STAGES.map(stageDef => {
    const n = stageDef.number;
    let entered = 0;
    let completed = 0;
    const completionDays: number[] = [];

    for (const lead of leads) {
      if (lead.currentStageNumber < n && lead.status !== 'discarded' && lead.status !== 'paused') continue;
      const wf = workflows[lead.id];
      if (!wf) continue;
      const stageState = wf.stages[n];
      if (!stageState || stageState.status === 'locked') continue;

      entered++;
      if (stageState.status === 'complete' || stageState.status === 'skipped') {
        completed++;
        const start = stageState.startedAt ?? lead.createdAt;
        const end = stageState.completedAt ?? stageState.skippedAt ?? start;
        completionDays.push(diffDays(start, end));
      }
    }

    const dropped = entered - completed;
    const dropoutRate = entered > 0 ? dropped / entered : 0;
    const avgDaysToComplete = completionDays.length > 0
      ? Math.round((completionDays.reduce((a, b) => a + b, 0) / completionDays.length) * 10) / 10
      : 0;

    return { stageNumber: n, stageLabel: stageDef.label, entered, completed, dropped, dropoutRate, avgDaysToComplete };
  });
}
