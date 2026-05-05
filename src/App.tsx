import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { NewLeadPage } from '@/pages/NewLeadPage';
import { LeadDetailPage } from '@/pages/LeadDetailPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { KPIPage } from '@/pages/KPIPage';
import { useEffect } from 'react';
import { useLeadsStore } from '@/store/leadsStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { generateSeedData } from '@/lib/seedData';
import { saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants/storage';

function AppInit() {
  const hydrateLeads = useLeadsStore(s => s.hydrate);
  const hydrateWorkflows = useWorkflowStore(s => s.hydrate);

  useEffect(() => {
    // Seed demo data if first run (storage empty)
    const existing = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!existing || JSON.parse(existing).length === 0) {
      const { leads, contracts, workflows } = generateSeedData();
      saveToStorage(STORAGE_KEYS.LEADS, leads);
      saveToStorage(STORAGE_KEYS.CONTRACTS, contracts);
      saveToStorage(STORAGE_KEYS.WORKFLOWS, workflows);
    }
    hydrateLeads();
    hydrateWorkflows();
  }, []);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/new" element={<NewLeadPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailPage />} />
          <Route path="/leads/:leadId/stage/:stageNum" element={<LeadDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/kpi" element={<KPIPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
