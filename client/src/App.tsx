import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './features/home/HomePage';
import { RiskMapPage } from './features/map/RiskMapPage';
import { AlertsPage } from './features/alerts/AlertsPage';
import { IncidentsPage } from './features/incidents/IncidentsPage';
import { WhatsAppCRMPage } from './features/whatsapp/WhatsAppCRMPage';
import { ReportHazardPage } from './features/reporting/ReportHazardPage';
import { AdminPanelPage } from './features/admin/AdminPanelPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#EAF2EE] text-[#34433C]">
        {/* Header with logo-bg.png */}
        <Navbar />

        {/* Main Routed Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<RiskMapPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/whatsapp" element={<WhatsAppCRMPage />} />
            <Route path="/report" element={<ReportHazardPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer with logo.png */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
