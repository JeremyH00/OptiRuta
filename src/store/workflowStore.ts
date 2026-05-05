import { create } from 'zustand';
import type { Contract, WorkflowInstance, SignatureRecord, ValidationChecklist, PaymentPlanRecord } from '@/types';
import { generateId } from '@/lib/idGenerator';
import { nowIso } from '@/lib/dateUtils';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import {
  buildInitialWorkflow,
  applyCompleteStage,
  applySkipStage,
  applyBlockStage,
  applyUnblockStage,
  canAccessStage,
  getStageStatus,
} from '@/lib/stageEngine';

interface WorkflowState {
  workflows: Record<string, WorkflowInstance>;
  contracts: Record<string, Contract>;
  hydrated: boolean;

  hydrate: () => void;
  initWorkflow: (leadId: string) => void;
  completeStage: (leadId: string, stageNumber: number) => void;
  skipStage: (leadId: string, stageNumber: number) => void;
  blockStage: (leadId: string, stageNumber: number, reason: string) => void;
  unblockStage: (leadId: string, stageNumber: number) => void;

  updateContract: (leadId: string, patch: Partial<Contract>) => void;
  setTitularSignature: (leadId: string, sig: SignatureRecord) => void;
  setCoDebtorSignature: (leadId: string, sig: SignatureRecord) => void;
  setValidationResult: (leadId: string, checklist: ValidationChecklist, notes: string, passed: boolean) => void;
  setApproval: (leadId: string, approver: string, notes: string, approved: boolean) => void;
  setPaymentPlan: (leadId: string, plan: PaymentPlanRecord) => void;
  setEnrollment: (leadId: string, csManager: string, sessionDate: string) => void;

  reactivateWorkflow: (leadId: string) => void;
  deleteWorkflow: (leadId: string) => void;

  getWorkflow: (leadId: string) => WorkflowInstance | undefined;
  getContract: (leadId: string) => Contract | undefined;
  canAccess: (leadId: string, stageNumber: number) => boolean;
  stageStatus: (leadId: string, stageNumber: number) => import('@/types').StageStatus;
}

function saveAll(workflows: Record<string, WorkflowInstance>, contracts: Record<string, Contract>) {
  saveToStorage(STORAGE_KEYS.WORKFLOWS, workflows);
  saveToStorage(STORAGE_KEYS.CONTRACTS, contracts);
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: {},
  contracts: {},
  hydrated: false,

  hydrate() {
    if (get().hydrated) return;
    const workflows = loadFromStorage<Record<string, WorkflowInstance>>(STORAGE_KEYS.WORKFLOWS, {});
    const contracts = loadFromStorage<Record<string, Contract>>(STORAGE_KEYS.CONTRACTS, {});
    set({ workflows, contracts, hydrated: true });
  },

  initWorkflow(leadId) {
    const existing = get().workflows[leadId];
    if (existing) return;
    const workflow = buildInitialWorkflow(leadId);
    const contract: Contract = {
      id: generateId(),
      leadId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      hasCoDebtor: false,
      validationAttempts: 0,
      platformAccessGranted: false,
    };
    set(state => {
      const workflows = { ...state.workflows, [leadId]: workflow };
      const contracts = { ...state.contracts, [leadId]: contract };
      saveAll(workflows, contracts);
      return { workflows, contracts };
    });
  },

  completeStage(leadId, stageNumber) {
    const state = get();
    const wf = state.workflows[leadId];
    const contract = state.contracts[leadId];
    if (!wf || !contract) return;
    const now = nowIso();
    const hasCoDebtor = contract.hasCoDebtor;
    const updated = applyCompleteStage(wf, stageNumber, now, hasCoDebtor);
    set(s => {
      const workflows = { ...s.workflows, [leadId]: updated };
      saveAll(workflows, s.contracts);
      return { workflows };
    });
  },

  skipStage(leadId, stageNumber) {
    const wf = get().workflows[leadId];
    if (!wf) return;
    const updated = applySkipStage(wf, stageNumber, nowIso());
    set(s => {
      const workflows = { ...s.workflows, [leadId]: updated };
      saveAll(workflows, s.contracts);
      return { workflows };
    });
  },

  blockStage(leadId, stageNumber, reason) {
    const wf = get().workflows[leadId];
    if (!wf) return;
    const updated = applyBlockStage(wf, stageNumber, reason);
    set(s => {
      const workflows = { ...s.workflows, [leadId]: updated };
      saveAll(workflows, s.contracts);
      return { workflows };
    });
  },

  unblockStage(leadId, stageNumber) {
    const wf = get().workflows[leadId];
    if (!wf) return;
    const updated = applyUnblockStage(wf, stageNumber);
    set(s => {
      const workflows = { ...s.workflows, [leadId]: updated };
      saveAll(workflows, s.contracts);
      return { workflows };
    });
  },

  updateContract(leadId, patch) {
    set(state => {
      const prev = state.contracts[leadId];
      if (!prev) return state;
      const contracts = {
        ...state.contracts,
        [leadId]: { ...prev, ...patch, updatedAt: nowIso() },
      };
      saveAll(state.workflows, contracts);
      return { contracts };
    });
  },

  setTitularSignature(leadId, sig) {
    get().updateContract(leadId, { titularSignature: sig });
  },

  setCoDebtorSignature(leadId, sig) {
    get().updateContract(leadId, { coDebtorSignature: sig });
  },

  setValidationResult(leadId, checklist, notes, passed) {
    const contract = get().contracts[leadId];
    const attempts = (contract?.validationAttempts ?? 0) + 1;
    get().updateContract(leadId, {
      validationChecklist: checklist,
      validationNotes: notes,
      validationPassed: passed,
      validationAttempts: attempts,
      lastValidationRejectionReason: passed ? undefined : notes,
    });
    if (!passed) {
      get().blockStage(leadId, 10, notes || 'Validación fallida');
    }
  },

  setApproval(leadId, approver, notes, approved) {
    get().updateContract(leadId, {
      approvalStatus: approved ? 'approved' : 'rejected',
      approvedBy: approver,
      approvalNotes: notes,
      approvalDate: nowIso(),
    });
    if (!approved) {
      get().blockStage(leadId, 11, notes || 'Aprobación rechazada');
    }
  },

  setPaymentPlan(leadId, plan) {
    get().updateContract(leadId, { paymentPlan: plan });
  },

  setEnrollment(leadId, csManager, sessionDate) {
    get().updateContract(leadId, {
      enrollmentDate: nowIso(),
      platformAccessGranted: true,
      csManager,
      onboardingSessionDate: sessionDate,
    });
  },

  reactivateWorkflow(leadId) {
    const wf = get().workflows[leadId];
    if (!wf) return;
    // Reset stage 3 back to pending so the evaluation result can be changed
    const updated = {
      ...wf,
      stages: {
        ...wf.stages,
        3: { ...wf.stages[3], status: 'pending' as const, completedAt: undefined, blockedAt: undefined },
        // Re-lock stages 4+ that depend on evaluation result
        4: { ...wf.stages[4], status: 'locked' as const },
        5: { ...wf.stages[5], status: 'locked' as const },
        6: { ...wf.stages[6], status: 'locked' as const },
        7: { ...wf.stages[7], status: 'locked' as const },
        8: { ...wf.stages[8], status: 'locked' as const },
        9: { ...wf.stages[9], status: 'locked' as const },
        10: { ...wf.stages[10], status: 'locked' as const },
        11: { ...wf.stages[11], status: 'locked' as const },
        12: { ...wf.stages[12], status: 'locked' as const },
        13: { ...wf.stages[13], status: 'locked' as const },
      },
    };
    set(s => {
      const workflows = { ...s.workflows, [leadId]: updated };
      saveAll(workflows, s.contracts);
      return { workflows };
    });
  },

  deleteWorkflow(leadId) {
    set(s => {
      const workflows = { ...s.workflows };
      const contracts = { ...s.contracts };
      delete workflows[leadId];
      delete contracts[leadId];
      saveAll(workflows, contracts);
      return { workflows, contracts };
    });
  },

  getWorkflow(leadId) {
    return get().workflows[leadId];
  },

  getContract(leadId) {
    return get().contracts[leadId];
  },

  canAccess(leadId, stageNumber) {
    const wf = get().workflows[leadId];
    const contract = get().contracts[leadId];
    if (!wf) return false;
    return canAccessStage(wf, stageNumber, contract?.hasCoDebtor ?? false);
  },

  stageStatus(leadId, stageNumber) {
    const wf = get().workflows[leadId];
    if (!wf) return 'locked';
    return getStageStatus(wf, stageNumber);
  },
}));
