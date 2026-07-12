import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { formatLocalDate, formatLocalTime } from "../../lib/dateOverlap";

interface Booking {
  id: string;
  resourceAssetId: string;
  startTime: string;
  endTime: string;
  status: string;
  resourceAsset: { name: string } | null;
}

function buildWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function BookingBoard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assetId, setAssetId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState(true);

  const weekDates = useMemo(() => buildWeekDates(), []);

  const bookingsByDate = useMemo(() => {
    return weekDates.map((date) => {
      const dateKey = date.toDateString();
      return {
        date,
        bookings: bookings.filter((booking) => {
          const bookingDate = new Date(booking.startTime).toDateString();
          return bookingDate === dateKey;
        }),
      };
    });
  }, [bookings, weekDates]);

  async function loadBookings() {
    setLoading(true);
    setMessage("");
    try {
      const response = await apiClient.get("/bookings?mine=true");
      setBookings(response.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!assetId || !startTime || !endTime) {
      setMessage("Asset, start time, and end time are required.");
      return;
    }

    try {
      await apiClient.post("/bookings", { assetId, departmentId, startTime, endTime });
      setMessage("Booking created successfully.");
      setAssetId("");
      setDepartmentId("");
      setStartTime("");
      setEndTime("");
      await loadBookings();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Booking failed.");
    }
  }

  async function handleCancel(id: string) {
    setMessage("");
    try {
      await apiClient.delete(`/bookings/${id}`);
      await loadBookings();
      setMessage("Booking cancelled.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Cancel failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Resource Booking</h1>
          <p className="text-sm text-slate-500">Reserve bookable assets and review your bookings in a calendar layout.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCalendarView(true)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${calendarView ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Calendar view
          </button>
          <button
            onClick={() => setCalendarView(false)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${!calendarView ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            List view
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div className="space-y-3">
          <input
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Asset ID"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            placeholder="Department ID (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-3">
          <label className="block text-sm text-slate-600">
            Start time
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-600">
            End time
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white" type="submit">
            Create booking
          </button>
        </div>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Bookings for the week</h2>
          <span className="text-sm text-slate-500">{loading ? "Refreshing..." : `${bookings.length} bookings`}</span>
        </div>

        {calendarView ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px] grid-cols-7 gap-3">
              {bookingsByDate.map((day) => (
                <div key={day.date.toDateString()} className="space-y-3 rounded-2xl border border-slate-200 p-3">
                  <div className="border-b border-slate-200 pb-2">
                    <p className="text-sm font-semibold text-slate-900">{formatLocalDate(day.date.toISOString())}</p>
                    <p className="text-xs text-slate-500">{day.date.toLocaleDateString(undefined, { weekday: "short" })}</p>
                  </div>
                  {day.bookings.length === 0 ? (
                    <p className="text-xs text-slate-500">No bookings</p>
                  ) : (
                    day.bookings.map((booking) => (
                      <div key={booking.id} className="rounded-2xl bg-slate-50 p-3 text-xs">
                        <p className="font-medium text-slate-900">{booking.resourceAsset?.name || booking.resourceAssetId}</p>
                        <p className="text-slate-600">
                          {formatLocalTime(booking.startTime)} - {formatLocalTime(booking.endTime)}
                        </p>
                        <p className="mt-1 text-slate-500">{booking.status}</p>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet. Create one above.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{booking.resourceAsset?.name || booking.resourceAssetId}</p>
                      <p className="text-xs text-slate-500">
                        {formatLocalDate(booking.startTime)} · {formatLocalTime(booking.startTime)} - {formatLocalTime(booking.endTime)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{booking.status}</span>
                  </div>
                  {booking.status === "UPCOMING" ? (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="mt-4 inline-flex rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      Cancel booking
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
