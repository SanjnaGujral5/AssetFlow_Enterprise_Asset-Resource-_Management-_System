import { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  Check,
  X,
  UserCircle2,
} from "lucide-react";
import {
  useMaintenanceKanban,
  useCreateMaintenance,
  useUpdateMaintenanceStatus,
} from "../../features/maintenance/useMaintenance";
import { useAssets } from "../../features/assets/useAssets";
import { useAuthStore } from "../../store/authStore";
import { MaintenanceStatus, Priority } from "../../types";

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-blue-50 text-blue-700 ring-blue-600/20",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-600/20",
  HIGH: "bg-red-50 text-red-700 ring-red-600/20",
};

const PRIORITY_ICONS: Record<Priority, React.ElementType> = {
  LOW: Clock,
  MEDIUM: AlertTriangle,
  HIGH: AlertCircle,
};

const COLUMN_TITLES: Record<MaintenanceStatus, string> = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  TECHNICIAN_ASSIGNED: "Tech Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected", // Usually hidden from kanban, but needed for type
};

export function MaintenanceKanban() {
  const user = useAuthStore((s) => s.user);
  const canManage =
    user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  const { data: columns = [], isLoading } = useMaintenanceKanban();
  const { data: availableAssets } = useAssets({
    status: "AVAILABLE",
    limit: 100,
  });

  const createRequest = useCreateMaintenance();
  const updateStatus = useUpdateMaintenanceStatus();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");

  // Assignment modal state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [techName, setTechName] = useState("");

  function handleRaiseRequest() {
    if (!assetId || issue.length < 5) return;
    createRequest.mutate(
      { assetId, issueDescription: issue, priority },
      {
        onSuccess: () => {
          setAssetId("");
          setIssue("");
          setPriority("MEDIUM");
          setShowForm(false);
        },
      }
    );
  }

  function handleTransition(id: string, newStatus: MaintenanceStatus) {
    if (newStatus === "TECHNICIAN_ASSIGNED") {
      setAssigningId(id);
      return;
    }

    updateStatus.mutate({ id, status: newStatus });
  }

  function handleAssignTech() {
    if (!assigningId || !techName) return;
    updateStatus.mutate(
      { id: assigningId, status: "TECHNICIAN_ASSIGNED", technicianName: techName },
      {
        onSuccess: () => {
          setAssigningId(null);
          setTechName("");
        },
      }
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Maintenance &amp; Repairs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage asset maintenance requests through their lifecycle.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Wrench size={16} />
          Raise Request
        </button>
      </div>

      {/* Raise Request Form (Collapsible) */}
      {showForm && (
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            New Maintenance Request
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Asset <span className="text-red-500">*</span>
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select asset...</option>
                {(availableAssets?.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={3}
              placeholder="Describe the problem..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleRaiseRequest}
              disabled={!assetId || issue.length < 5 || createRequest.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {createRequest.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full min-w-max gap-4">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            columns.map((col) => (
              <div
                key={col.status}
                className="flex h-full w-80 flex-col rounded-xl bg-slate-100 p-3"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="font-semibold text-slate-700">
                    {COLUMN_TITLES[col.status]}
                  </h3>
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
                    {col.items.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
                  {col.items.map((item) => {
                    const PIcon = PRIORITY_ICONS[item.priority];
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              PRIORITY_COLORS[item.priority]
                            }`}
                          >
                            <PIcon size={10} />
                            {item.priority}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="mb-1 text-sm font-semibold text-slate-900">
                          {item.asset.name}
                        </h4>
                        <p className="mb-3 text-xs font-mono text-brand-600">
                          {item.asset.assetTag}
                        </p>
                        <p className="mb-4 line-clamp-3 text-xs text-slate-600">
                          {item.issueDescription}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <UserCircle2 size={14} />
                            {item.raisedBy.name.split(" ")[0]}
                          </div>
                          
                          {/* Transitions (Role gated) */}
                          {canManage && col.status === "PENDING" && (
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleTransition(item.id, "REJECTED")}
                                className="rounded bg-red-50 p-1 text-red-600 hover:bg-red-100"
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                              <button
                                onClick={() => handleTransition(item.id, "APPROVED")}
                                className="rounded bg-emerald-50 p-1 text-emerald-600 hover:bg-emerald-100"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          )}

                          {canManage && col.status === "APPROVED" && (
                            <button
                              onClick={() => handleTransition(item.id, "TECHNICIAN_ASSIGNED")}
                              className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 opacity-0 transition-opacity hover:bg-brand-100 group-hover:opacity-100"
                            >
                              Assign <ArrowRight size={12} />
                            </button>
                          )}

                          {canManage && col.status === "TECHNICIAN_ASSIGNED" && (
                            <button
                              onClick={() => handleTransition(item.id, "IN_PROGRESS")}
                              className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 opacity-0 transition-opacity hover:bg-brand-100 group-hover:opacity-100"
                            >
                              Start <ArrowRight size={12} />
                            </button>
                          )}

                          {canManage && col.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleTransition(item.id, "RESOLVED")}
                              className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 opacity-0 transition-opacity hover:bg-emerald-100 group-hover:opacity-100"
                            >
                              Resolve <Check size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {col.items.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Technician Assignment Modal */}
      {assigningId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Assign Technician
            </h3>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Technician Name
            </label>
            <input
              type="text"
              autoFocus
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="e.g. John Doe, External Vendor"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAssigningId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTech}
                disabled={!techName || updateStatus.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
