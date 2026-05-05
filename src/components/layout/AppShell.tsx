import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '@/components/ui/Toast';

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
