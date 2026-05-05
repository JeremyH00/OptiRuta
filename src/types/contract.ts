export type PlanTier = 'Básico' | 'Pro' | 'Enterprise';
export type IdType = 'CC' | 'NIT' | 'CE' | 'Pasaporte';

export interface Plan {
  tier: PlanTier;
  monthlyPrice: number;
  routeLimit: number;
  vehicleLimit: number;
  features: string[];
}

export interface Party {
  fullName: string;
  idType: IdType;
  idNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  position?: string;
}

export interface CoDebtor extends Party {
  relationship: string;
}

export interface SignatureRecord {
  signedAt: string;
  method: 'physical' | 'digital';
  signatoryName: string;
  confirmedBy: string;
  notes?: string;
}

export interface ValidationChecklist {
  allDocumentsPresent: boolean;
  allSignaturesCollected: boolean;
  partyInfoCorrect: boolean;
  planDetailsCorrect: boolean;
  paymentTermsCorrect: boolean;
}

export interface Contract {
  id: string;
  leadId: string;
  createdAt: string;
  updatedAt: string;

  // Stage 4
  selectedPlan?: PlanTier;
  agreedPrice?: number;
  contractStartDate?: string;
  commercialNotes?: string;

  // Stage 5
  slaAccepted?: boolean;
  dataProtectionAccepted?: boolean;
  contractNotes?: string;

  // Stage 6
  titular?: Party;
  hasCoDebtor: boolean;
  coDebtor?: CoDebtor;

  // Stage 7
  documentsGeneratedAt?: string;

  // Stage 8
  titularSignature?: SignatureRecord;

  // Stage 9
  coDebtorSignature?: SignatureRecord;

  // Stage 10
  validationChecklist?: ValidationChecklist;
  validationNotes?: string;
  validationPassed?: boolean;
  validationAttempts: number;
  lastValidationRejectionReason?: string;

  // Stage 11
  approvalStatus?: 'approved' | 'rejected';
  approvedBy?: string;
  approvalNotes?: string;
  approvalDate?: string;

  // Stage 12
  paymentPlan?: import('./payment').PaymentPlanRecord;

  // Stage 13
  enrollmentDate?: string;
  platformAccessGranted: boolean;
  csManager?: string;
  onboardingSessionDate?: string;
}
