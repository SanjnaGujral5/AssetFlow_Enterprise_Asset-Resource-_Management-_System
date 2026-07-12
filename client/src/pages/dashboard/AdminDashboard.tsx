import { Boxes, ClipboardList, CalendarClock, Wrench, ArrowLeftRight, Clock, DollarSign } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useDashboardMetrics } from "../../features/reports/useReports";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: metrics, isLoading } = useDashboardMetrics();

  const KPI_CARDS = [
    { label: "Total Assets", value: metrics?.summary.totalAssets ?? "—", icon: Boxes },
    { label: "Total Value", value: metrics ? `$${metrics.summary.totalValue.toLocaleString()}` : "—", icon: DollarSign },
    { label: "Active Allocations", value: metrics?.summary.activeAllocations ?? "—", icon: ClipboardList },
    { label: "Open Maintenance", value: metrics?.summary.openMaintenance ?? "—", icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's the current operational snapshot for your organization.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <Icon size={18} className="text-brand-500" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Management Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/assets/register" className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <Boxes className="mb-2 text-brand-600" size={24} />
              <span className="text-sm font-medium text-slate-700">Register Assets</span>
            </Link>
            <Link to="/allocations" className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <ArrowLeftRight className="mb-2 text-brand-600" size={24} />
              <span className="text-sm font-medium text-slate-700">Transfer Requests</span>
            </Link>
            <Link to="/maintenance" className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <Wrench className="mb-2 text-brand-600" size={24} />
              <span className="text-sm font-medium text-slate-700">Maintenance</span>
            </Link>
            <Link to="/org-setup" className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <ClipboardList className="mb-2 text-brand-600" size={24} />
              <span className="text-sm font-medium text-slate-700">Org Setup</span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Asset Status Breakdown</h2>
          <div className="space-y-4">
            {metrics?.statusBreakdown.map((statusItem) => (
              <div key={statusItem.status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{statusItem.status.replace("_", " ")}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {statusItem.count}
                </span>
              </div>
            ))}
            {!metrics?.statusBreakdown.length && !isLoading && (
              <p className="text-sm text-slate-500">No assets found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
