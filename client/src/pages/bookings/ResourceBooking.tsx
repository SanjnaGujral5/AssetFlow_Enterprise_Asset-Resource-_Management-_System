import { useState } from "react";
import {
  CalendarClock,
  Clock,
  MapPin,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
} from "lucide-react";
import {
  useBookings,
  useBookableResources,
  useCreateBooking,
  useCancelBooking,
} from "../../features/bookings/useBookings";
import { useAuthStore } from "../../store/authStore";
import { BookingStatus } from "../../types";

const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  UPCOMING: "bg-blue-50 text-blue-700 ring-blue-600/20",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
};

const ITEMS_PER_PAGE = 15;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function ResourceBooking() {
  const user = useAuthStore((s) => s.user);

  // Form state
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  // Data hooks
  const { data: resources = [] } = useBookableResources();
  const { data: bookingsData, isLoading } = useBookings({
    resourceAssetId: resourceId || undefined,
    status: filterStatus || undefined,
    date: resourceId ? date : undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const bookings = bookingsData?.data ?? [];
  const total = bookingsData?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const selectedResource = resources.find((r) => r.id === resourceId);

  function handleBook() {
    if (!resourceId || !date || !startTime || !endTime) return;

    const startISO = new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = new Date(`${date}T${endTime}:00`).toISOString();

    createBooking.mutate(
      { resourceAssetId: resourceId, startTime: startISO, endTime: endISO },
      {
        onSuccess: () => {
          setStartTime("09:00");
          setEndTime("10:00");
        },
      }
    );
  }

  function handleCancel(bookingId: string) {
    if (window.confirm("Cancel this booking?")) {
      cancelBooking.mutate(bookingId);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Resource Booking
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Book shared resources like meeting rooms, projectors, and equipment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===== Left: Booking Form ===== */}
        <div className="space-y-4 lg:col-span-1">
          {/* Resource selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <CalendarPlus size={18} className="text-brand-500" />
              Book a Resource
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Resource <span className="text-red-500">*</span>
                </label>
                <select
                  value={resourceId}
                  onChange={(e) => {
                    setResourceId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select resource...</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.location ? ` — ${r.location}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected resource info card */}
              {selectedResource && (
                <div className="rounded-xl bg-brand-50 p-3">
                  <p className="text-sm font-medium text-brand-800">
                    {selectedResource.name}
                  </p>
                  {selectedResource.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-600">
                      <MapPin size={10} />
                      {selectedResource.location}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-brand-600">
                    {selectedResource.category?.name ?? "Resource"}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {createBooking.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {(createBooking.error as any)?.response?.data?.message ||
                    "Booking failed"}
                </p>
              )}

              {createBooking.isSuccess && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Booking confirmed!
                </p>
              )}

              <button
                onClick={handleBook}
                disabled={
                  !resourceId || !date || !startTime || !endTime || createBooking.isPending
                }
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {createBooking.isPending ? "Booking..." : "Book Now"}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Right: Bookings List ===== */}
        <div className="lg:col-span-2">
          {/* Status filter */}
          <div className="mb-4 flex flex-wrap gap-1">
            {[
              { label: "All", value: "" },
              { label: "Upcoming", value: "UPCOMING" },
              { label: "Ongoing", value: "ONGOING" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Cancelled", value: "CANCELLED" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilterStatus(tab.value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterStatus === tab.value
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {resourceId ? "Bookings for Selected Resource" : "All Bookings"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date &amp; Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Booked By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!isLoading && bookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-16 text-center"
                      >
                        <CalendarClock
                          size={40}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="text-sm font-medium text-slate-500">
                          No bookings found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {resourceId
                            ? "No bookings for this resource on the selected date."
                            : "Select a resource and book a time slot to get started."}
                        </p>
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    bookings.map((booking) => {
                      const start = new Date(booking.startTime);
                      const end = new Date(booking.endTime);
                      const durationMs = end.getTime() - start.getTime();
                      const durationMins = Math.round(durationMs / 60000);
                      const hours = Math.floor(durationMins / 60);
                      const mins = durationMins % 60;
                      const durationStr = hours
                        ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`
                        : `${mins}m`;

                      const canCancel =
                        (booking.status === "UPCOMING" ||
                          booking.status === "ONGOING") &&
                        (booking.bookedById === user?.id ||
                          user?.role === "ADMIN");

                      return (
                        <tr
                          key={booking.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-900">
                              {booking.resourceAsset?.name}
                            </p>
                            {booking.resourceAsset?.location && (
                              <p className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin size={10} />
                                {booking.resourceAsset.location}
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <p className="text-sm text-slate-900">
                              {formatDate(booking.startTime)}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={10} />
                              {formatTime(booking.startTime)} –{" "}
                              {formatTime(booking.endTime)}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                            {durationStr}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                            {booking.bookedBy?.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                BOOKING_STATUS_STYLES[booking.status]
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                disabled={cancelBooking.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                              >
                                <XCircle size={12} />
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {total > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-xs font-medium text-slate-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
