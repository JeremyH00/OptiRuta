import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead } from '@/types';

interface Props {
  lead?: Lead;
  isNew?: boolean;
}

export function Stage01LeadRegistration({ lead, isNew }: Props) {
  const navigate = useNavigate();
  const addLead = useLeadsStore(s => s.addLead);
  const updateLead = useLeadsStore(s => s.updateLead);
  const initWorkflow = useWorkflowStore(s => s.initWorkflow);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [form, setForm] = useState({
    companyName: lead?.companyName ?? '',
    contactName: lead?.contactName ?? '',
    contactEmail: lead?.contactEmail ?? '',
    contactPhone: lead?.contactPhone ?? '',
    source: lead?.source ?? 'inbound_form',
    notes: lead?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Requerido';
    if (!form.contactName.trim()) e.contactName = 'Requerido';
    if (!form.contactEmail.trim()) e.contactEmail = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail = 'Email inválido';
    if (!form.contactPhone.trim()) e.contactPhone = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isNew) {
      const id = addLead({ ...form, source: form.source as Lead['source'] });
      initWorkflow(id);
      completeStage(id, 1);
      advanceStage(id, 2);
      addToast('Lead registrado correctamente', 'success');
      navigate(`/leads/${id}/stage/2`);
    } else if (lead) {
      updateLead(lead.id, { ...form, source: form.source as Lead['source'] });
      addToast('Lead actualizado', 'success');
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Datos del Lead" subtitle="Información básica del prospecto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Empresa / Razón Social" value={form.companyName} onChange={set('companyName')} error={errors.companyName} placeholder="Distribuidora XYZ S.A.S" />
          <Input label="Nombre del Contacto" value={form.contactName} onChange={set('contactName')} error={errors.contactName} placeholder="Juan García" />
          <Input label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} error={errors.contactEmail} placeholder="juan@empresa.com" />
          <Input label="Teléfono" value={form.contactPhone} onChange={set('contactPhone')} error={errors.contactPhone} placeholder="+57 300 123 4567" />
          <Select label="Canal de origen" value={form.source} onChange={set('source')} className="md:col-span-2">
            <option value="inbound_form">Formulario web (Inbound)</option>
            <option value="inbound_webinar">Webinar (Inbound)</option>
            <option value="inbound_seo">SEO / Orgánico (Inbound)</option>
            <option value="outbound_prospecting">Prospección activa (Outbound)</option>
            <option value="referral">Referido</option>
          </Select>
          <Textarea label="Notas iniciales" value={form.notes} onChange={set('notes')} placeholder="Contexto inicial, necesidades expresadas, próximos pasos..." className="md:col-span-2" />
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit">{isNew ? 'Registrar Lead y Continuar' : 'Guardar Cambios'}</Button>
        </div>
      </Card>
    </form>
  );
}
