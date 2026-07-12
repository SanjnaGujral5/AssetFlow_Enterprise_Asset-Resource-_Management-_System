import { Laptop, CalendarClock, Wrench, Plus, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAllocations } from "../../features/allocations/useAllocations";
import { useBookings } from "../../features/bookings/useBookings";
import { Link } from "react-router-dom";

export function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);

  // Fetch only allocations where this user is the holder
  const { data: myAllocations, isLoading: loadingAllocations } = useAllocations({
    holderUserId: user?.id,
    status: "ACTIVE", // Only show currently active ones
  });

  // Fetch bookings where this user is the booker
  const { data: myBookings, isLoading: loadingBookings } = useBookings(); // We need to filter this client side or update backend to accept bookerId, let's filter client side for now.

  const activeBookings = myBookings?.data?.filter((b: any) => b.bookedById === user?.id && b.status !== "CANCELLED" && b.status !== "COMPLETED") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your personalized workspace for assigned equipment and resources.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/assets" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
          <div className="rounded-full bg-brand-50 p-3">
            <Plus className="text-brand-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Request Asset</h3>
            <p className="text-xs text-slate-500">Browse directory</p>
          </div>
        </Link>
        <Link to="/bookings" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
          <div className="rounded-full bg-blue-50 p-3">
            <CalendarClock className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Book Resource</h3>
            <p className="text-xs text-slate-500">Reserve time slot</p>
          </div>
        </Link>
        <Link to="/maintenance" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
          <div className="rounded-full bg-amber-50 p-3">
            <Wrench className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Report Issue</h3>
            <p className="text-xs text-slate-500">Request repair</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Assigned Assets */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Laptop size={18} className="text-slate-500" />
              My Assigned Assets
            </h2>
          </div>
          <div className="p-0">
            {loadingAllocations ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading assets...</div>
            ) : !myAllocations?.data || myAllocations.data.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                You have no assigned assets.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myAllocations.data.map((alloc) => (
                  <li key={alloc.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{alloc.asset.name}</p>
                      <p className="text-xs text-slate-500">Tag: {alloc.asset.assetTag}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
            <Link to="/allocations" className="flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
              View transfer options <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* My Active Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CalendarClock size={18} className="text-slate-500" />
              Upcoming Bookings
            </h2>
          </div>
          <div className="p-0">
            {loadingBookings ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading bookings...</div>
            ) : activeBookings.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                You have no upcoming bookings.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeBookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{booking.resourceAsset.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {booking.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
            <Link to="/bookings" className="flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
              Manage bookings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
