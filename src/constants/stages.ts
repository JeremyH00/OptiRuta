import type { StageDef } from '@/types';

export const STAGES: StageDef[] = [
  {
    number: 1, id: 'lead_registration', label: 'Registro de Lead',
    phase: 1, phaseLabel: 'Comercial',
    description: 'Captura inicial del prospecto en el CRM (inbound / outbound)',
    icon: 'UserPlus', prereqs: [], optional: false,
  },
  {
    number: 2, id: 'evaluation', label: 'Evaluación',
    phase: 1, phaseLabel: 'Comercial',
    description: 'Calificación: tamaño empresa, entregas diarias, urgencia, capacidad de pago',
    icon: 'ClipboardList', prereqs: [1], optional: false,
  },
  {
    number: 3, id: 'evaluation_result', label: 'Resultado de Evaluación',
    phase: 1, phaseLabel: 'Comercial',
    description: 'Decisión documentada: Avanzar / Descartar / Seguimiento',
    icon: 'CheckCircle2', prereqs: [2], optional: false,
  },
  {
    number: 4, id: 'purchase_confirmation', label: 'Confirmación de Compra',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Selección de plan (Básico / Pro / Enterprise) y condiciones comerciales',
    icon: 'ShoppingCart', prereqs: [3], optional: false,
  },
  {
    number: 5, id: 'contractual_process', label: 'Proceso Contractual',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Preparación del contrato, SLA y política de protección de datos',
    icon: 'FileText', prereqs: [4], optional: false,
  },
  {
    number: 6, id: 'party_registration', label: 'Registro de Partes',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Datos del titular y codeudor/aval (si aplica)',
    icon: 'Users', prereqs: [5], optional: false,
  },
  {
    number: 7, id: 'document_generation', label: 'Generación de Documentos',
    phase: 2, phaseLabel: 'Contractual',
    description: 'El sistema genera automáticamente los documentos contractuales',
    icon: 'FileOutput', prereqs: [6], optional: false,
  },
  {
    number: 8, id: 'titular_signature', label: 'Firma Titular',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Firma física o digital del representante legal del cliente',
    icon: 'PenLine', prereqs: [7], optional: false,
  },
  {
    number: 9, id: 'codebtor_signature', label: 'Firma Codeudor',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Firma del codeudor o aval (N/A si no se registró codeudor)',
    icon: 'PenLine', prereqs: [7], optional: true,
  },
  {
    number: 10, id: 'validation', label: 'Validación',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Verificación interna: documentos completos, firmas válidas, información correcta',
    icon: 'ClipboardCheck', prereqs: [8, 9], optional: false,
  },
  {
    number: 11, id: 'approval', label: 'Aprobación',
    phase: 2, phaseLabel: 'Contractual',
    description: 'Aprobación formal por área legal, comercial o dirección',
    icon: 'BadgeCheck', prereqs: [10], optional: false,
  },
  {
    number: 12, id: 'payment_plan', label: 'Plan de Pagos',
    phase: 3, phaseLabel: 'Operativo',
    description: 'Activación del método de pago y configuración del ciclo de facturación',
    icon: 'CreditCard', prereqs: [11], optional: false,
  },
  {
    number: 13, id: 'enrollment', label: 'Matrícula',
    phase: 3, phaseLabel: 'Operativo',
    description: 'Activación oficial: acceso a plataforma + onboarding guiado',
    icon: 'Rocket', prereqs: [12], optional: false,
  },
];

export const PHASE_LABELS: Record<number, string> = {
  1: 'Comercial',
  2: 'Contractual',
  3: 'Operativo',
};

export const PHASE_COLORS: Record<number, string> = {
  1: 'bg-blue-600',
  2: 'bg-purple-600',
  3: 'bg-green-600',
};
