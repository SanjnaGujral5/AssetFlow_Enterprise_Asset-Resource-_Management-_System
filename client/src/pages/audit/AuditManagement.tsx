import { useState } from "react";
import {
  ClipboardCheck,
  Search,
  Plus,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ChevronRight,
  FileWarning,
} from "lucide-react";
import {
  useAuditCycles,
  useAuditCycle,
  useCreateAuditCycle,
  useCloseAuditCycle,
  useVerifyAuditItem,
} from "../../features/audit/useAudit";
import { useAuthStore } from "../../store/authStore";
import { AuditCycle, AuditResult } from "../../types";

const RESULT_STYLES: Record<AuditResult, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  MISSING: "bg-red-50 text-red-700 ring-red-600/20",
  DAMAGED: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export function AuditManagement() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  const { data: cycles = [], isLoading: isLoadingCycles } = useAuditCycles();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  // Detail view
  const { data: cycleDetail, isLoading: isLoadingDetail } = useAuditCycle(
    selectedCycleId ?? ""
  );

  // Mutations
  const createCycle = useCreateAuditCycle();
  const closeCycle = useCloseAuditCycle();
  const verifyItem = useVerifyAuditItem();

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [scopeLocation, setScopeLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleCreate() {
    if (!startDate || !endDate) return;
    createCycle.mutate(
      { scopeLocation: scopeLocation || undefined, startDate, endDate },
      {
        onSuccess: (data) => {
          setShowForm(false);
          setScopeLocation("");
          setStartDate("");
          setEndDate("");
          setSelectedCycleId(data.id);
        },
      }
    );
  }

  function handleVerify(itemId: string, result: AuditResult) {
    verifyItem.mutate({ itemId, result });
  }

  // --- Detail View Render ---
  if (selectedCycleId && cycleDetail) {
    const isClosed = cycleDetail.status === "CLOSED";
    const discrepancies = cycleDetail.items?.filter(
      (i) => i.result === "MISSING" || i.result === "DAMAGED"
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedCycleId(null)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Audit Cycle Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {cycleDetail.scopeLocation
                ? `Location Scope: ${cycleDetail.scopeLocation}`
                : "Full Organization Scope"}{" "}
              • {new Date(cycleDetail.startDate).toLocaleDateString()} to{" "}
              {new Date(cycleDetail.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                isClosed
                  ? "bg-slate-100 text-slate-700 ring-slate-500/20"
                  : "bg-brand-50 text-brand-700 ring-brand-600/20"
              }`}
            >
              {cycleDetail.status}
            </span>
            {!isClosed && canManage && (
              <button
                onClick={() => {
                  if (window.confirm("Close this audit cycle?")) {
                    closeCycle.mutate(cycleDetail.id);
                  }
                }}
                disabled={closeCycle.isPending}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {closeCycle.isPending ? "Closing..." : "Close Audit"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Checklist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Asset Checklist ({cycleDetail.items?.length ?? 0} items)
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {cycleDetail.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.asset.name}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono text-brand-600">
                          {item.asset.assetTag}
                        </span>
                        <span>{item.asset.category?.name}</span>
                        {item.asset.location && (
                          <span>Loc: {item.asset.location}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.result ? (
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              RESULT_STYLES[item.result]
                            }`}
                          >
                            {item.result}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            by {item.verifiedBy?.name.split(" ")[0]}
                          </span>
                        </div>
                      ) : isClosed ? (
                        <span className="text-sm text-slate-400">Not verified</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(item.id, "VERIFIED")}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                            title="Verify (Present & Good)"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleVerify(item.id, "MISSING")}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                            title="Mark Missing"
                          >
                            <XCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleVerify(item.id, "DAMAGED")}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                            title="Mark Damaged"
                          >
                            <AlertOctagon size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discrepancy Report */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-red-100 bg-red-50 px-4 py-3 flex items-center gap-2">
                <FileWarning size={18} className="text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">
                  Discrepancy Report
                </h3>
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-800">
                  {discrepancies?.length ?? 0}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {discrepancies?.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">
                    No discrepancies found.
                  </p>
                ) : (
                  discrepancies?.map((item) => (
                    <div key={item.id} className="p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.asset.name}
                      </p>
                      <p className="font-mono text-xs text-slate-500 mt-0.5 mb-2">
                        {item.asset.assetTag}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          RESULT_STYLES[item.result as AuditResult]
                        }`}
                      >
                        {item.result}
                      </span>
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

  // --- List View Render ---
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Audit Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create audit cycles, verify asset presence, and track discrepancies.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Plus size={16} />
            New Audit Cycle
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Create Audit Cycle
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Scope (Location) <span className="text-xs text-slate-400 font-normal ml-1">Optional</span>
              </label>
              <input
                type="text"
                value={scopeLocation}
                onChange={(e) => setScopeLocation(e.target.value)}
                placeholder="e.g. New York Office"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          {createCycle.isError && (
            <p className="mt-3 text-sm text-red-600">
              {(createCycle.error as any)?.response?.data?.message || "Failed to create cycle"}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!startDate || !endDate || createCycle.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {createCycle.isPending ? "Generating..." : "Generate Checklist"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingCycles ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : cycles.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <ClipboardCheck size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No audit cycles</p>
          </div>
        ) : (
          cycles.map((cycle) => (
            <div
              key={cycle.id}
              onClick={() => setSelectedCycleId(cycle.id)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    cycle.status === "OPEN"
                      ? "bg-brand-50 text-brand-700 ring-brand-600/20"
                      : "bg-slate-100 text-slate-700 ring-slate-500/20"
                  }`}
                >
                  {cycle.status}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(cycle.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="mb-1 font-semibold text-slate-900">
                {cycle.scopeLocation ? `${cycle.scopeLocation} Audit` : "General Audit"}
              </h3>
              <p className="mb-4 text-xs text-slate-500">
                {new Date(cycle.startDate).toLocaleDateString()} –{" "}
                {new Date(cycle.endDate).toLocaleDateString()}
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-emerald-600">
                    {cycle.verifiedCount}
                  </p>
                  <p className="text-[10px] font-medium uppercase text-slate-500">
                    Verified
                  </p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-lg font-semibold text-red-600">
                    {cycle.discrepancyCount}
                  </p>
                  <p className="text-[10px] font-medium uppercase text-slate-500">
                    Issues
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    {cycle.pendingCount}
                  </p>
                  <p className="text-[10px] font-medium uppercase text-slate-500">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
