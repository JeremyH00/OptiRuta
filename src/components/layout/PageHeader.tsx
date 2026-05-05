import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back, action }: Props) {
  const navigate = useNavigate();
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen);

  return (
    <div className="flex items-start justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white">
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mt-0.5 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        {back && (
          <button onClick={() => navigate(-1)} className="mt-0.5 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
