import { useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Kpis {
  available: number;
  allocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
}

interface DepartmentSummaryItem {
  departmentId: string;
  name: string;
  employeeCount: number;
  assetCount: number;
}

interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor: { name: string };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#14b8a6"];

export function Reports() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [frequency, setFrequency] = useState<any[]>([]);
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummaryItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [message, setMessage] = useState("");

  async function loadReports() {
    try {
      const [kpiRes, freqRes, deptRes, activityRes] = await Promise.all([
        apiClient.get("/reports/kpis"),
        apiClient.get("/reports/maintenance-frequency"),
        apiClient.get("/reports/department-summary"),
        apiClient.get("/reports/activity-log"),
      ]);
      setKpis(kpiRes.data);
      setFrequency(freqRes.data);
      setDepartmentSummary(deptRes.data);
      setActivityLog(activityRes.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to load reports.");
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const maintenanceData = frequency.map((item: any) => ({
    name: `${item.priority} / ${item.status}`,
    value: item._count.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">View utilization, maintenance trends, and recent activity across the organization.</p>
      </div>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Dashboard KPIs</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {kpis ? (
                [
                  { label: "Available", value: kpis.available },
                  { label: "Allocated", value: kpis.allocated },
                  { label: "Maintenance Today", value: kpis.maintenanceToday },
                  { label: "Active Bookings", value: kpis.activeBookings },
                  { label: "Pending Transfers", value: kpis.pendingTransfers },
                  { label: "Upcoming Returns", value: kpis.upcomingReturns },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Loading KPI data…</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Maintenance Frequency</h2>
            <p className="mt-1 text-sm text-slate-500">Report by priority and status for the last 30 days.</p>

            {maintenanceData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={maintenanceData} dataKey="value" nameKey="name" outerRadius={96} innerRadius={44}>
                      {maintenanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Loading chart…</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Department Summary</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Department</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Employees</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Assets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentSummary.map((item) => (
                    <tr key={item.departmentId}>
                      <td className="px-4 py-3 text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.employeeCount}</td>
                      <td className="px-4 py-3 text-slate-600">{item.assetCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {activityLog.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity found.</p>
              ) : (
                activityLog.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-900">{item.action}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.actor?.name} · {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">Entity: {item.entityType} / {item.entityId}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
