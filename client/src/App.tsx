import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/dashboard/Dashboard";
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
            {/* Additional protected routes (Assets, Allocations, Bookings,
                Maintenance, Audits, Reports, Notifications, Org Setup)
                are added here module by module in later phases. */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
