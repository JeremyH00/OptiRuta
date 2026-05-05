import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Checkbox } from '@/components/ui/Input';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import type { Lead, Contract, Party, CoDebtor } from '@/types';

interface Props { lead: Lead; contract: Contract }

type PartyForm = Omit<Party, 'idType'> & { idType: string };
type CoDebtorForm = Omit<CoDebtor, 'idType'> & { idType: string };

const emptyParty = (): PartyForm => ({ fullName: '', idType: 'CC', idNumber: '', email: '', phone: '', address: '', city: '', position: '' });
const emptyCoDebtor = (): CoDebtorForm => ({ ...emptyParty(), relationship: '' });

export function Stage06PartyRegistration({ lead, contract }: Props) {
  const navigate = useNavigate();
  const updateContract = useWorkflowStore(s => s.updateContract);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [titular, setTitular] = useState<PartyForm>(contract.titular ? { ...contract.titular } : emptyParty());
  const [hasCoDebtor, setHasCoDebtor] = useState(contract.hasCoDebtor);
  const [coDebtor, setCoDebtor] = useState<CoDebtorForm>(contract.coDebtor ? { ...contract.coDebtor } : emptyCoDebtor());

  function setT(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setTitular(prev => ({ ...prev, [field]: e.target.value }));
  }
  function setC(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCoDebtor(prev => ({ ...prev, [field]: e.target.value }));
  }

  function validate(): boolean {
    if (!titular.fullName || !titular.idNumber || !titular.email || !titular.phone) {
      addToast('Completa todos los campos obligatorios del titular', 'error');
      return false;
    }
    if (hasCoDebtor && (!coDebtor.fullName || !coDebtor.idNumber || !coDebtor.email || !coDebtor.relationship)) {
      addToast('Completa todos los campos del codeudor', 'error');
      return false;
    }
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    updateContract(lead.id, {
      titular: titular as Party,
      hasCoDebtor,
      coDebtor: hasCoDebtor ? coDebtor as CoDebtor : undefined,
    });
    completeStage(lead.id, 6);
    advanceStage(lead.id, 7);
    addToast('Partes registradas correctamente', 'success');
    navigate(`/leads/${lead.id}/stage/7`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card title="Titular del Contrato" subtitle="Representante legal del cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre completo *" value={titular.fullName} onChange={setT('fullName')} />
          <Select label="Tipo de documento *" value={titular.idType} onChange={setT('idType')}>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="NIT">NIT</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </Select>
          <Input label="Número de documento *" value={titular.idNumber} onChange={setT('idNumber')} />
          <Input label="Cargo / Posición" value={titular.position ?? ''} onChange={setT('position')} />
          <Input label="Email *" type="email" value={titular.email} onChange={setT('email')} />
          <Input label="Teléfono *" value={titular.phone} onChange={setT('phone')} />
          <Input label="Dirección" value={titular.address} onChange={setT('address')} />
          <Input label="Ciudad" value={titular.city} onChange={setT('city')} />
        </div>
      </Card>

      <Card title="Codeudor / Aval">
        <Checkbox
          label="Registrar codeudor o aval para este contrato"
          checked={hasCoDebtor}
          onChange={e => setHasCoDebtor(e.target.checked)}
          className="mb-4"
        />

        {hasCoDebtor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <Input label="Nombre completo *" value={coDebtor.fullName} onChange={setC('fullName')} />
            <Select label="Tipo de documento *" value={coDebtor.idType} onChange={setC('idType')}>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="NIT">NIT</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </Select>
            <Input label="Número de documento *" value={coDebtor.idNumber} onChange={setC('idNumber')} />
            <Input label="Relación con el titular *" value={coDebtor.relationship} onChange={setC('relationship')} placeholder="Socio, Garante, Director..." />
            <Input label="Email *" type="email" value={coDebtor.email} onChange={setC('email')} />
            <Input label="Teléfono" value={coDebtor.phone} onChange={setC('phone')} />
            <Input label="Dirección" value={coDebtor.address} onChange={setC('address')} />
            <Input label="Ciudad" value={coDebtor.city} onChange={setC('city')} />
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Registrar Partes y Continuar</Button>
      </div>
    </form>
  );
}
