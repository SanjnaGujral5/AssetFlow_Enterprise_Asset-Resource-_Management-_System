import { Boxes, ClipboardList, CalendarClock, Wrench, ArrowLeftRight, Clock } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

// Phase 1 placeholder: static KPI cards so the shell is demoable
// immediately. These will be wired to GET /dashboard/kpis in the
// Reports & Analytics phase.
const KPI_CARDS = [
  { label: "Assets Available", value: "—", icon: Boxes },
  { label: "Assets Allocated", value: "—", icon: ClipboardList },
  { label: "Maintenance Today", value: "—", icon: Wrench },
  { label: "Active Bookings", value: "—", icon: CalendarClock },
  { label: "Pending Transfers", value: "—", icon: ArrowLeftRight },
  { label: "Upcoming Returns", value: "—", icon: Clock },
];

export function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s the current operational snapshot for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Asset registry, allocations, bookings, maintenance, and audit widgets will appear here
        as each module is built out.
      </div>
    </div>
  );
}
