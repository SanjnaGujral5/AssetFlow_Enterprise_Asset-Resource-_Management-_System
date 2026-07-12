import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../types";

interface Props {
  allowedRoles?: Role[];
}

// Wraps protected routes: redirects to /login if not authenticated, and
// optionally restricts access to a set of roles. This is a UX
// convenience only — the backend roleGuard is the real enforcement.
export function RoleGuardedRoute({ allowedRoles }: Props) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
