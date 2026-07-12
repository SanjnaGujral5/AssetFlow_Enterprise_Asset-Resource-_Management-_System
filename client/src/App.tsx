import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { AssetDirectory } from "./pages/assets/AssetDirectory";
import { AllocationsTransfers } from "./pages/allocations/AllocationsTransfers";
import { ResourceBooking } from "./pages/bookings/ResourceBooking";
import { MaintenanceKanban } from "./pages/maintenance/MaintenanceKanban";
import { AuditManagement } from "./pages/audit/AuditManagement";
import { ReportsDashboard } from "./pages/reports/ReportsDashboard";
import { Notifications } from "./pages/notifications/Notifications";
import { OrgSetup } from "./pages/org-setup/OrgSetup";
import { AssetRegistration } from "./pages/assets/AssetRegistration";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { RoleGuardedRoute } from "./components/shared/RoleGuardedRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<RoleGuardedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets/register" element={<AssetRegistration />} />
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/allocations" element={<AllocationsTransfers />} />
            <Route path="/bookings" element={<ResourceBooking />} />
            <Route path="/maintenance" element={<MaintenanceKanban />} />
            <Route path="/audits" element={<AuditManagement />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/org-setup" element={<OrgSetup />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

