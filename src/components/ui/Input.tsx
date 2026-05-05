import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, hint, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', id, ...rest }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        className={`rounded-lg border px-3 py-2 text-sm shadow-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, ...rest }: TextareaProps) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={areaId} className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        id={areaId}
        rows={3}
        className={`rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className = '', id, ...rest }: CheckboxProps) {
  const cbId = id ?? `cb-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label htmlFor={cbId} className={`flex items-start gap-2.5 cursor-pointer ${className}`}>
      <input id={cbId} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" {...rest} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
