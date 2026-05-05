import { create } from 'zustand';
import type { Lead, LeadStatus, EvaluationScore, EvaluationResult } from '@/types';
import { generateId } from '@/lib/idGenerator';
import { nowIso } from '@/lib/dateUtils';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants/storage';

type NewLeadInput = Pick<Lead, 'companyName' | 'contactName' | 'contactEmail' | 'contactPhone' | 'source' | 'notes'>;

interface LeadsState {
  leads: Lead[];
  hydrated: boolean;

  hydrate: () => void;
  addLead: (data: NewLeadInput) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  setEvaluationScore: (id: string, score: EvaluationScore, notes: string) => void;
  setEvaluationResult: (id: string, result: EvaluationResult, notes: string, followupDate?: string) => void;
  discardLead: (id: string) => void;
  pauseLead: (id: string) => void;
  reactivateLead: (id: string) => void;
  deleteLead: (id: string) => void;
  convertLead: (id: string) => void;
  advanceStage: (id: string, stageNumber: number) => void;
  getLeadById: (id: string) => Lead | undefined;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  hydrated: false,

  hydrate() {
    if (get().hydrated) return;
    const stored = loadFromStorage<Lead[]>(STORAGE_KEYS.LEADS, []);
    set({ leads: stored, hydrated: true });
  },

  addLead(data) {
    const id = generateId();
    const now = nowIso();
    const lead: Lead = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      currentStageNumber: 1,
      stageHistory: [],
      ...data,
    };
    set(state => {
      const leads = [...state.leads, lead];
      saveToStorage(STORAGE_KEYS.LEADS, leads);
      return { leads };
    });
    return id;
  },

  updateLead(id, patch) {
    set(state => {
      const leads = state.leads.map(l =>
        l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l,
      );
      saveToStorage(STORAGE_KEYS.LEADS, leads);
      return { leads };
    });
  },

  setEvaluationScore(id, score, notes) {
    get().updateLead(id, { evaluationScore: score, evaluationNotes: notes, currentStageNumber: 2 });
  },

  setEvaluationResult(id, result, notes, followupDate) {
    const patch: Partial<Lead> = {
      evaluationResult: result,
      evaluationResultNotes: notes,
      evaluationResultDate: nowIso(),
      currentStageNumber: result === 'advance' ? 4 : 3,
      followupDate,
    };
    if (result === 'discard') patch.status = 'discarded';
    if (result === 'followup') patch.status = 'paused';
    get().updateLead(id, patch);
  },

  discardLead(id) {
    get().updateLead(id, { status: 'discarded' });
  },

  pauseLead(id) {
    get().updateLead(id, { status: 'paused' });
  },

  reactivateLead(id) {
    get().updateLead(id, {
      status: 'active',
      evaluationResult: undefined,
      evaluationResultNotes: undefined,
      evaluationResultDate: undefined,
      followupDate: undefined,
      currentStageNumber: 2,
    });
  },

  deleteLead(id) {
    set(state => {
      const leads = state.leads.filter(l => l.id !== id);
      saveToStorage(STORAGE_KEYS.LEADS, leads);
      return { leads };
    });
  },

  convertLead(id) {
    get().updateLead(id, { status: 'converted', currentStageNumber: 13 });
  },

  advanceStage(id, stageNumber) {
    const lead = get().getLeadById(id);
    if (!lead) return;
    const entry = { stageNumber: lead.currentStageNumber, completedAt: nowIso(), completedBy: 'Admin' };
    get().updateLead(id, {
      currentStageNumber: stageNumber,
      stageHistory: [...lead.stageHistory, entry],
    });
  },

  getLeadById(id) {
    return get().leads.find(l => l.id === id);
  },

  getLeadsByStatus(status) {
    return get().leads.filter(l => l.status === status);
  },
}));
