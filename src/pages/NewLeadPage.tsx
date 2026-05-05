import { PageHeader } from '@/components/layout/PageHeader';
import { Stage01LeadRegistration } from '@/components/stages/Stage01LeadRegistration';

export function NewLeadPage() {
  return (
    <div>
      <PageHeader title="Nuevo Lead" subtitle="Etapa 1 — Registro de Lead" back />
      <div className="p-8 max-w-3xl">
        <Stage01LeadRegistration isNew />
      </div>
    </div>
  );
}
