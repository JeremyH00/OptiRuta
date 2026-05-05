export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'auto_debit';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export interface PaymentPlanRecord {
  method: PaymentMethod;
  billingCycle: BillingCycle;
  startDate: string;
  bankName?: string;
  accountLast4?: string;
  cardLast4?: string;
  notes?: string;
}
