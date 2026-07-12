import { useState } from "react";
import { Bell, Check, CheckCheck, Clock, ArrowRight } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../features/notifications/useNotifications";

export function Notifications() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data, isLoading } = useNotifications(filter === "UNREAD");
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated on asset assignments, transfers, and maintenance alerts.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "UNREAD"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {data?.data.some((n) => !n.isRead) && (
        <div className="flex justify-end">
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))
        ) : data?.data.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <Bell size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              You're all caught up!
            </p>
            <p className="mt-1 text-xs text-slate-400">
              No new notifications right now.
            </p>
          </div>
        ) : (
          data?.data.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                notification.isRead
                  ? "border-slate-200 bg-white opacity-70"
                  : "border-brand-200 bg-brand-50/30 shadow-sm"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  notification.isRead
                    ? "bg-slate-100 text-slate-500"
                    : "bg-brand-100 text-brand-600"
                }`}
              >
                <Bell size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold ${
                      notification.isRead ? "text-slate-700" : "text-slate-900"
                    }`}
                  >
                    {notification.type.replace(/_/g, " ")}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markRead.mutate(notification.id)}
                  title="Mark as read"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
