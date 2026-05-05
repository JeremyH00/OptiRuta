import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { generateDocuments, type GeneratedDoc } from '@/lib/documentGenerator';
import type { Lead, Contract } from '@/types';
import { FileText, Printer, CheckCircle2 } from 'lucide-react';

interface Props { lead: Lead; contract: Contract }

export function Stage07DocumentGeneration({ lead, contract }: Props) {
  const navigate = useNavigate();
  const updateContract = useWorkflowStore(s => s.updateContract);
  const completeStage = useWorkflowStore(s => s.completeStage);
  const advanceStage = useLeadsStore(s => s.advanceStage);
  const addToast = useUIStore(s => s.addToast);

  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<string>('main_contract');
  const [confirmed, setConfirmed] = useState(!!contract.documentsGeneratedAt);

  useEffect(() => {
    const generated = generateDocuments(lead, contract);
    setDocs(generated);
    if (!contract.documentsGeneratedAt) {
      updateContract(lead.id, { documentsGeneratedAt: new Date().toISOString() });
    }
  }, []);

  function handleConfirm() {
    completeStage(lead.id, 7);
    advanceStage(lead.id, 8);
    setConfirmed(true);
    addToast('Documentos confirmados — proceder a firmas', 'success');
    navigate(`/leads/${lead.id}/stage/8`);
  }

  function handlePrint() {
    const doc = docs.find(d => d.id === activeDoc);
    if (!doc) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>${doc.title}</title><style>body{font-family:monospace;white-space:pre-wrap;padding:2rem;font-size:13px;line-height:1.6}</style></head><body>${doc.content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</body></html>`);
    win.print();
    win.close();
  }

  const current = docs.find(d => d.id === activeDoc);

  return (
    <div className="space-y-4">
      <Card
        title="Documentos Generados"
        subtitle="Revisa cada documento antes de confirmar"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer size={14} /> Imprimir
            </Button>
            {!confirmed && (
              <Button size="sm" onClick={handleConfirm}>
                <CheckCircle2 size={14} /> Confirmar documentos
              </Button>
            )}
          </div>
        }
      >
        <div className="flex gap-2 mb-4 flex-wrap">
          {docs.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDoc(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${activeDoc === d.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <FileText size={13} /> {d.title}
            </button>
          ))}
        </div>

        {current && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin">
            <pre className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap font-mono">{current.content}</pre>
          </div>
        )}

        {confirmed && (
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 size={16} /> Documentos confirmados — procede a recopilar las firmas.
          </div>
        )}
      </Card>
    </div>
  );
}
