import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Building2,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles?: Role[]; // if omitted, visible to every role
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Organization Setup", to: "/org-setup", icon: Building2, roles: ["ADMIN"] },
  { label: "Assets", to: "/assets", icon: Boxes, roles: ["ADMIN", "ASSET_MANAGER", "DEPT_HEAD"] },
  { label: "Allocations & Transfers", to: "/allocations", icon: ArrowLeftRight, roles: ["ADMIN", "ASSET_MANAGER", "DEPT_HEAD"] },
  { label: "Resource Booking", to: "/bookings", icon: CalendarClock },
  { label: "Maintenance", to: "/maintenance", icon: Wrench },
  { label: "Audits", to: "/audits", icon: ClipboardCheck, roles: ["ADMIN", "ASSET_MANAGER"] },
  { label: "Reports & Analytics", to: "/reports", icon: BarChart3, roles: ["ADMIN", "ASSET_MANAGER", "DEPT_HEAD"] },
  { label: "Notifications", to: "/notifications", icon: Bell },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          AF
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">AssetFlow</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.role.replace("_", " ")}</p>
        </div>
      )}
    </aside>
  );
}
