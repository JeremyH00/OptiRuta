import React from 'react';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', value: 'text-orange-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
  gray: { bg: 'bg-gray-50', icon: 'bg-gray-100 text-gray-600', value: 'text-gray-700' },
};

export function KPICard({ title, value, subtitle, icon, color = 'blue' }: Props) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border border-gray-200 p-5 ${c.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.value}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
