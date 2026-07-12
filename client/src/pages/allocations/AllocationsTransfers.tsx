import { useState } from "react";
import {
  ArrowLeftRight,
  Package,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Send,
} from "lucide-react";
import { useAllocations, useCreateAllocation, useReturnAsset } from "../../features/allocations/useAllocations";
import {
  useTransfers,
  useCreateTransfer,
  useApproveTransfer,
  useRejectTransfer,
} from "../../features/allocations/useTransfers";
import { useUsers } from "../../features/allocations/useUsers";
import { useAssets } from "../../features/assets/useAssets";
import { useAuthStore } from "../../store/authStore";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { AllocationStatus, TransferStatus } from "../../types";

type Tab = "allocate" | "transfer";

const ALLOCATION_STATUS_STYLES: Record<AllocationStatus, string> = {
  ACTIVE: "bg-blue-50 text-blue-700 ring-blue-600/20",
  RETURNED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  OVERDUE: "bg-red-50 text-red-700 ring-red-600/20",
};

const TRANSFER_STATUS_STYLES: Record<TransferStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-700 ring-amber-600/20",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const ITEMS_PER_PAGE = 15;

export function AllocationsTransfers() {
  const user = useAuthStore((s) => s.user);
  const canManage =
    user?.role === "ADMIN" ||
    user?.role === "ASSET_MANAGER" ||
    user?.role === "DEPT_HEAD";

  const [tab, setTab] = useState<Tab>("allocate");

  // ---- Allocate form state ----
  const [allocAssetId, setAllocAssetId] = useState("");
  const [allocUserId, setAllocUserId] = useState("");
  const [allocReturnDate, setAllocReturnDate] = useState("");
  const [allocPage, setAllocPage] = useState(1);

  // ---- Transfer form state ----
  const [txAssetId, setTxAssetId] = useState("");
  const [txToUserId, setTxToUserId] = useState("");
  const [txReason, setTxReason] = useState("");
  const [txPage, setTxPage] = useState(1);

  // ---- Data hooks ----
  const { data: availableAssets } = useAssets({ status: "AVAILABLE", limit: 100 });
  const { data: allocatedAssets } = useAssets({ status: "ALLOCATED", limit: 100 });
  const { data: usersData } = useUsers();
  const users = usersData ?? [];

  const { data: allocData, isLoading: allocLoading } = useAllocations({
    page: allocPage,
    limit: ITEMS_PER_PAGE,
  });

  const { data: txData, isLoading: txLoading } = useTransfers({
    page: txPage,
    limit: ITEMS_PER_PAGE,
  });

  const createAllocation = useCreateAllocation();
  const returnAsset = useReturnAsset();
  const createTransfer = useCreateTransfer();
  const approveTransfer = useApproveTransfer();
  const rejectTransfer = useRejectTransfer();

  // ---- Handlers ----
  function handleAllocate() {
    if (!allocAssetId || !allocUserId) return;
    createAllocation.mutate(
      {
        assetId: allocAssetId,
        holderUserId: allocUserId,
        expectedReturnDate: allocReturnDate || undefined,
      },
      {
        onSuccess: () => {
          setAllocAssetId("");
          setAllocUserId("");
          setAllocReturnDate("");
        },
      }
    );
  }

  function handleReturn(allocationId: string) {
    if (window.confirm("Mark this asset as returned?")) {
      returnAsset.mutate({ id: allocationId });
    }
  }

  function handleCreateTransfer() {
    if (!txAssetId || !txToUserId) return;
    createTransfer.mutate(
      { assetId: txAssetId, toUserId: txToUserId, reason: txReason || undefined },
      {
        onSuccess: () => {
          setTxAssetId("");
          setTxToUserId("");
          setTxReason("");
        },
      }
    );
  }

  const allocations = allocData?.data ?? [];
  const allocTotal = allocData?.total ?? 0;
  const allocTotalPages = Math.ceil(allocTotal / ITEMS_PER_PAGE);

  const transfers = txData?.data ?? [];
  const txTotal = txData?.total ?? 0;
  const txTotalPages = Math.ceil(txTotal / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Asset Allocation &amp; Transfer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Allocate assets to users, process returns, and manage transfer requests.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setTab("allocate")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "allocate"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <Package size={16} />
            Allocation
          </span>
        </button>
        <button
          onClick={() => setTab("transfer")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "transfer"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeftRight size={16} />
            Transfer
          </span>
        </button>
      </div>

      {/* ==================== ALLOCATE TAB ==================== */}
      {tab === "allocate" && (
        <div className="space-y-6">
          {/* Allocate Form */}
          {canManage && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                <UserCheck size={18} className="text-brand-500" />
                Allocate Asset
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Asset <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={allocAssetId}
                    onChange={(e) => setAllocAssetId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select available asset...</option>
                    {(availableAssets?.data ?? []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={allocUserId}
                    onChange={(e) => setAllocUserId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Expected Return
                  </label>
                  <input
                    type="date"
                    value={allocReturnDate}
                    onChange={(e) => setAllocReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
              {createAllocation.isError && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {(createAllocation.error as any)?.response?.data?.message ||
                    "Allocation failed"}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAllocate}
                  disabled={!allocAssetId || !allocUserId || createAllocation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Package size={14} />
                  {createAllocation.isPending ? "Allocating..." : "Allocate Asset"}
                </button>
              </div>
            </div>
          )}

          {/* Allocations Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Allocation History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Holder
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Allocated
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expected Return
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    {canManage && (
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: canManage ? 6 : 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!allocLoading && allocations.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManage ? 6 : 5}
                        className="px-4 py-12 text-center text-sm text-slate-500"
                      >
                        No allocations yet.
                      </td>
                    </tr>
                  )}

                  {!allocLoading &&
                    allocations.map((alloc) => (
                      <tr key={alloc.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">
                            {alloc.asset?.name}
                          </p>
                          <p className="text-xs font-mono text-brand-600">
                            {alloc.asset?.assetTag}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {alloc.holderUser?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {new Date(alloc.allocatedAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {alloc.expectedReturnDate
                            ? new Date(alloc.expectedReturnDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ALLOCATION_STATUS_STYLES[alloc.status]
                              }`}
                          >
                            {alloc.status}
                          </span>
                        </td>
                        {canManage && (
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {alloc.status === "ACTIVE" && (
                              <button
                                onClick={() => handleReturn(alloc.id)}
                                disabled={returnAsset.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                              >
                                <RotateCcw size={12} />
                                Return
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {allocTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  {(allocPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(allocPage * ITEMS_PER_PAGE, allocTotal)} of{" "}
                  {allocTotal}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAllocPage((p) => Math.max(1, p - 1))}
                    disabled={allocPage <= 1}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-xs font-medium text-slate-600">
                    {allocPage} / {allocTotalPages}
                  </span>
                  <button
                    onClick={() => setAllocPage((p) => Math.min(allocTotalPages, p + 1))}
                    disabled={allocPage >= allocTotalPages}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TRANSFER TAB ==================== */}
      {tab === "transfer" && (
        <div className="space-y-6">
          {/* Transfer Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Send size={18} className="text-brand-500" />
              Request Transfer
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Asset <span className="text-red-500">*</span>
                </label>
                <select
                  value={txAssetId}
                  onChange={(e) => setTxAssetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select allocated asset...</option>
                  {(allocatedAssets?.data ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Transfer To <span className="text-red-500">*</span>
                </label>
                <select
                  value={txToUserId}
                  onChange={(e) => setTxToUserId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select recipient...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                value={txReason}
                onChange={(e) => setTxReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Reason for transfer..."
              />
            </div>
            {createTransfer.isError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {(createTransfer.error as any)?.response?.data?.message ||
                  "Transfer request failed"}
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCreateTransfer}
                disabled={!txAssetId || !txToUserId || createTransfer.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send size={14} />
                {createTransfer.isPending ? "Submitting..." : "Create Request"}
              </button>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Transfer Requests
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Requested By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    {canManage && (
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: canManage ? 6 : 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!txLoading && transfers.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManage ? 6 : 5}
                        className="px-4 py-12 text-center text-sm text-slate-500"
                      >
                        No transfer requests yet.
                      </td>
                    </tr>
                  )}

                  {!txLoading &&
                    transfers.map((tx) => (
                      <tr key={tx.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">
                            {tx.asset?.name}
                          </p>
                          <p className="text-xs font-mono text-brand-600">
                            {tx.asset?.assetTag}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {tx.fromUser?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {tx.toUser?.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {tx.requestedBy?.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TRANSFER_STATUS_STYLES[tx.status]
                              }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        {canManage && (
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {tx.status === "REQUESTED" && (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => approveTransfer.mutate(tx.id)}
                                  disabled={approveTransfer.isPending}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                                >
                                  <Check size={12} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectTransfer.mutate(tx.id)}
                                  disabled={rejectTransfer.isPending}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                >
                                  <X size={12} />
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {txTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  {(txPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(txPage * ITEMS_PER_PAGE, txTotal)} of {txTotal}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    disabled={txPage <= 1}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-xs font-medium text-slate-600">
                    {txPage} / {txTotalPages}
                  </span>
                  <button
                    onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                    disabled={txPage >= txTotalPages}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:bg-white disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
