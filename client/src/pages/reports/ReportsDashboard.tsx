import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Wrench, 
  PieChart, 
  Activity 
} from "lucide-react";
import { useDashboardMetrics } from "../../features/reports/useReports";

// Colors for status breakdown
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  ALLOCATED: "bg-brand-500",
  UNDER_MAINTENANCE: "bg-amber-500",
  DISPOSED: "bg-slate-400",
  RETIRED: "bg-slate-600",
};

// Generate deterministic colors for categories
const CATEGORY_COLORS = [
  "bg-indigo-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-sky-500",
  "bg-pink-500",
  "bg-lime-500",
];

export function ReportsDashboard() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, statusBreakdown, categoryBreakdown } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Comprehensive Reporting
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          High-level metrics and breakdown of your organization's assets.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Assets</p>
              <p className="text-2xl font-semibold text-slate-900">
                {summary.totalAssets.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Value</p>
              <p className="text-2xl font-semibold text-slate-900">
                ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Allocations</p>
              <p className="text-2xl font-semibold text-slate-900">
                {summary.activeAllocations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Open Maintenance</p>
              <p className="text-2xl font-semibold text-slate-900">
                {summary.openMaintenance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown (Proportional Bar) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">
              Assets by Status
            </h2>
          </div>

          <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
            {statusBreakdown.map((item) => {
              const width = (item.count / Math.max(1, summary.totalAssets)) * 100;
              return (
                <div
                  key={item.status}
                  style={{ width: `${width}%` }}
                  className={`${STATUS_COLORS[item.status] || "bg-slate-300"} transition-all`}
                  title={`${item.status}: ${item.count}`}
                />
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    STATUS_COLORS[item.status] || "bg-slate-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">
                    {item.status}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.count} <span className="text-xs font-normal text-slate-400">({((item.count / Math.max(1, summary.totalAssets)) * 100).toFixed(1)}%)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown (Proportional Bar) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">
              Assets by Category
            </h2>
          </div>

          <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
            {categoryBreakdown.map((item, idx) => {
              const width = (item.count / Math.max(1, summary.totalAssets)) * 100;
              return (
                <div
                  key={item.categoryId}
                  style={{ width: `${width}%` }}
                  className={`${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} transition-all`}
                  title={`${item.categoryName}: ${item.count}`}
                />
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categoryBreakdown.map((item, idx) => (
              <div key={item.categoryId} className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700" title={item.categoryName}>
                    {item.categoryName}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.count} <span className="text-xs font-normal text-slate-400">({((item.count / Math.max(1, summary.totalAssets)) * 100).toFixed(1)}%)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
