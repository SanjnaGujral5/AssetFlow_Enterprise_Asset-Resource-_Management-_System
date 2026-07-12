import { useAuthStore } from "../../store/authStore";
import { AdminDashboard } from "./AdminDashboard";
import { EmployeeDashboard } from "./EmployeeDashboard";

export function Dashboard() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === "EMPLOYEE") {
    return <EmployeeDashboard />;
  }

  // Admin, Dept Head, and Asset Manager see the KPI dashboard
  return <AdminDashboard />;
}
