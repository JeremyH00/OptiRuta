export interface StageMetrics {
  stageNumber: number;
  stageLabel: string;
  entered: number;
  completed: number;
  dropped: number;
  dropoutRate: number;
  avgDaysToComplete: number;
}

export interface KPISnapshot {
  computedAt: string;
  totalLeads: number;
  activeClients: number;
  conversionRate: number;
  avgCycleDays: number;
  validationRejectionPct: number;
  totalReprocessingCount: number;
  avgSigningDays: number;
  stageMetrics: StageMetrics[];
}
