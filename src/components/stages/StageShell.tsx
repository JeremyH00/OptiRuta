import React from 'react';
import { Card } from '@/components/ui/Card';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import type { StageStatus } from '@/types';

interface Props {
  stageNumber: number;
  stageLabel: string;
  description: string;
  status: StageStatus;
  children: React.ReactNode;
}

export function StageShell({ stageNumber, stageLabel, description, status, children }: Props) {
  const isLocked = status === 'locked';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          ${status === 'complete' ? 'bg-green-100 text-green-700' :
            status === 'blocked' ? 'bg-red-100 text-red-700' :
            status === 'locked' ? 'bg-gray-100 text-gray-400' :
            'bg-brand-100 text-brand-700'}`}>
          {stageNumber}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">{stageLabel}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {status === 'complete' && <CheckCircle2 size={22} className="text-green-500 shrink-0" />}
        {status === 'blocked' && <AlertCircle size={22} className="text-red-500 shrink-0" />}
        {status === 'locked' && <Lock size={18} className="text-gray-300 shrink-0" />}
      </div>

      {status === 'blocked' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          Esta etapa fue rechazada. Revise los datos y vuelva a enviar.
        </div>
      )}

      {isLocked ? (
        <Card>
          <div className="flex flex-col items-center py-8 text-center text-gray-400">
            <Lock size={32} className="mb-3" />
            <p className="font-medium">Etapa bloqueada</p>
            <p className="text-sm mt-1">Completa las etapas anteriores para desbloquear esta.</p>
          </div>
        </Card>
      ) : status === 'complete' ? (
        <>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={16} className="shrink-0" />
            Esta etapa ya fue completada. Los datos son de solo lectura.
          </div>
          <fieldset disabled className="[&_input]:opacity-70 [&_textarea]:opacity-70 [&_select]:opacity-70 [&_button[type=submit]]:hidden [&_button[type=button]:not([data-allow])]:hidden">
            {children}
          </fieldset>
        </>
      ) : (
        children
      )}
    </div>
  );
}
