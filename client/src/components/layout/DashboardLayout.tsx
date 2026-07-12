import { Outlet, Link, useLocation } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { useUnreadCount } from "../../features/notifications/useNotifications";

export function DashboardLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
