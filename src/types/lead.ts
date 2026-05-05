export type LeadStatus = 'active' | 'discarded' | 'paused' | 'converted';
export type EvaluationResult = 'advance' | 'discard' | 'followup';
export type LeadSource = 'inbound_form' | 'inbound_webinar' | 'inbound_seo' | 'outbound_prospecting' | 'referral';

export interface EvaluationScore {
  companySize: 1 | 2 | 3;
  dailyDeliveries: 1 | 2 | 3;
  urgency: 1 | 2 | 3;
  paymentCapacity: 1 | 2 | 3;
  total: number;
}

export interface StageHistoryEntry {
  stageNumber: number;
  completedAt: string;
  completedBy: string;
  notes?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;

  // Stage 1
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: LeadSource;
  notes: string;

  // Stage 2
  evaluationScore?: EvaluationScore;
  evaluationNotes?: string;

  // Stage 3
  evaluationResult?: EvaluationResult;
  evaluationResultNotes?: string;
  evaluationResultDate?: string;
  followupDate?: string;

  currentStageNumber: number;
  stageHistory: StageHistoryEntry[];
}
