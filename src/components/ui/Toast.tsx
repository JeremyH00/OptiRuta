import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-72 max-w-sm
          ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
          {t.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
          {t.type === 'error' && <XCircle size={16} className="shrink-0" />}
          {t.type === 'info' && <Info size={16} className="shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
