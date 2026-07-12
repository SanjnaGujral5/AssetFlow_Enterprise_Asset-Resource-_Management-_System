import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { AssetList } from "./pages/assets/AssetList";
import { AssetDetail } from "./pages/assets/AssetDetail";
import { AllocationBoard } from "./pages/allocations/AllocationBoard";
import { BookingBoard } from "./pages/bookings/BookingBoard";
import { MaintenanceBoard } from "./pages/maintenance/MaintenanceBoard";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { RoleGuardedRoute } from "./components/shared/RoleGuardedRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RoleGuardedRoute/>}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        </Route>
        <Route path="/health" element={<AllocationBoard />} />
        <Route element={<RoleGuardedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/allocations" element={<AllocationBoard />} />
            <Route path="/bookings" element={<BookingBoard />} />
            <Route path="/maintenance" element={<MaintenanceBoard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
