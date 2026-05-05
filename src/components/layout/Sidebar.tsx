import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, UserCheck, Route, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/clients', icon: UserCheck, label: 'Clientes Activos' },
  { to: '/kpi', icon: BarChart3, label: 'Indicadores KPI' },
];

export function Sidebar() {
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-60 bg-brand-900 text-white flex flex-col z-30 transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-brand-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 rounded-lg p-1.5">
              <Route size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">OptiRuta</span>
              <p className="text-brand-200 text-xs mt-0.5">Proceso Comercial</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-300 hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-brand-800">
          <p className="text-brand-400 text-xs">v1.0 · Mayo 2026</p>
        </div>
      </aside>
    </>
  );
}
