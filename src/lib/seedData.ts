import type { Lead, Contract, WorkflowInstance } from '@/types';
import { buildInitialWorkflow, applyCompleteStage } from './stageEngine';
import { nowIso } from './dateUtils';

const past = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export function generateSeedData(): {
  leads: Lead[];
  contracts: Record<string, Contract>;
  workflows: Record<string, WorkflowInstance>;
} {
  const leads: Lead[] = [];
  const contracts: Record<string, Contract> = {};
  const workflows: Record<string, WorkflowInstance> = {};

  function mkLead(id: string, overrides: Partial<Lead>): Lead {
    return {
      id,
      createdAt: past(20),
      updatedAt: past(1),
      status: 'active',
      companyName: 'Empresa Demo',
      contactName: 'Demo User',
      contactEmail: 'demo@empresa.com',
      contactPhone: '+57 300 000 0000',
      source: 'inbound_form',
      notes: '',
      currentStageNumber: 1,
      stageHistory: [],
      ...overrides,
    };
  }

  function mkContract(leadId: string, overrides: Partial<Contract> = {}): Contract {
    return {
      id: `contract-${leadId}`,
      leadId,
      createdAt: past(18),
      updatedAt: past(1),
      hasCoDebtor: false,
      validationAttempts: 0,
      platformAccessGranted: false,
      ...overrides,
    };
  }

  // Lead 1: Converted client (all 13 stages complete)
  const l1: Lead = mkLead('seed-1', {
    companyName: 'Distribuidora Los Andes SAS',
    contactName: 'Carlos Rodríguez',
    contactEmail: 'carlos@losandes.com.co',
    contactPhone: '+57 315 987 6543',
    source: 'inbound_form',
    status: 'converted',
    currentStageNumber: 13,
    createdAt: past(20),
    evaluationScore: { companySize: 3, dailyDeliveries: 3, urgency: 3, paymentCapacity: 2, total: 11 },
    evaluationResult: 'advance',
  });
  leads.push(l1);

  let wf1 = buildInitialWorkflow('seed-1');
  const stages1to13 = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  for (const s of stages1to13) {
    wf1 = applyCompleteStage(wf1, s, past(20 - s), false);
  }
  workflows['seed-1'] = wf1;
  contracts['seed-1'] = mkContract('seed-1', {
    selectedPlan: 'Pro',
    agreedPrice: 349000,
    contractStartDate: past(10),
    slaAccepted: true,
    dataProtectionAccepted: true,
    hasCoDebtor: false,
    titular: { fullName: 'Carlos Rodríguez', idType: 'CC', idNumber: '1234567890', email: 'carlos@losandes.com.co', phone: '+57 315 987 6543', address: 'Calle 80 # 12-34', city: 'Bogotá' },
    titularSignature: { signedAt: past(12), method: 'digital', signatoryName: 'Carlos Rodríguez', confirmedBy: 'Admin' },
    validationChecklist: { allDocumentsPresent: true, allSignaturesCollected: true, partyInfoCorrect: true, planDetailsCorrect: true, paymentTermsCorrect: true },
    validationPassed: true,
    validationAttempts: 1,
    approvalStatus: 'approved',
    approvedBy: 'María Gómez (Legal)',
    approvalDate: past(8),
    paymentPlan: { method: 'credit_card', billingCycle: 'monthly', startDate: past(5), cardLast4: '4242' },
    enrollmentDate: past(3),
    platformAccessGranted: true,
    csManager: 'Laura Martínez',
    onboardingSessionDate: past(2),
    documentsGeneratedAt: past(14),
  });

  // Lead 2: In contractual process (stage 8)
  const l2: Lead = mkLead('seed-2', {
    companyName: 'Logística Rápida Colombia',
    contactName: 'Andrea Morales',
    contactEmail: 'amorales@lograpida.co',
    source: 'outbound_prospecting',
    currentStageNumber: 8,
    evaluationScore: { companySize: 2, dailyDeliveries: 2, urgency: 3, paymentCapacity: 2, total: 9 },
    evaluationResult: 'advance',
  });
  leads.push(l2);

  let wf2 = buildInitialWorkflow('seed-2');
  for (const s of [1,2,3,4,5,6,7]) {
    wf2 = applyCompleteStage(wf2, s, past(15 - s), false);
  }
  workflows['seed-2'] = wf2;
  contracts['seed-2'] = mkContract('seed-2', {
    selectedPlan: 'Básico',
    agreedPrice: 149000,
    slaAccepted: true,
    dataProtectionAccepted: true,
    titular: { fullName: 'Andrea Morales', idType: 'CC', idNumber: '9876543210', email: 'amorales@lograpida.co', phone: '+57 311 222 3344', address: 'Av. El Dorado # 68-50', city: 'Bogotá' },
    documentsGeneratedAt: past(7),
  });

  // Lead 3: In evaluation (stage 2)
  const l3: Lead = mkLead('seed-3', {
    companyName: 'Mercados del Valle SAS',
    contactName: 'Pedro Jiménez',
    contactEmail: 'pedro@mercadosvalle.com',
    source: 'inbound_webinar',
    currentStageNumber: 2,
    createdAt: past(3),
    updatedAt: past(1),
  });
  leads.push(l3);

  let wf3 = buildInitialWorkflow('seed-3');
  wf3 = applyCompleteStage(wf3, 1, past(3), false);
  workflows['seed-3'] = wf3;
  contracts['seed-3'] = mkContract('seed-3');

  // Lead 4: Discarded
  const l4: Lead = mkLead('seed-4', {
    companyName: 'Tienda Don Ernesto',
    contactName: 'Ernesto Ríos',
    contactEmail: 'ernesto@donernesto.com',
    source: 'inbound_seo',
    status: 'discarded',
    currentStageNumber: 3,
    evaluationScore: { companySize: 1, dailyDeliveries: 1, urgency: 1, paymentCapacity: 1, total: 4 },
    evaluationResult: 'discard',
  });
  leads.push(l4);

  let wf4 = buildInitialWorkflow('seed-4');
  for (const s of [1,2,3]) {
    wf4 = applyCompleteStage(wf4, s, past(8 - s), false);
  }
  workflows['seed-4'] = wf4;
  contracts['seed-4'] = mkContract('seed-4');

  return { leads, contracts, workflows };
}
