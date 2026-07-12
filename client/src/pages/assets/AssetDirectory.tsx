import { useState, useMemo } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Boxes, MapPin, Pencil, Trash2 } from "lucide-react";
import { useAssets, useDeleteAsset } from "../../features/assets/useAssets";
import { useAuthStore } from "../../store/authStore";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { AssetFormModal } from "./AssetFormModal";
import { Asset, AssetStatus } from "../../types";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Allocated", value: "ALLOCATED" },
  { label: "Maintenance", value: "UNDER_MAINTENANCE" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Retired", value: "RETIRED" },
];

const ITEMS_PER_PAGE = 20;

export function AssetDirectory() {
  const user = useAuthStore((s) => s.user);
  const canManage =
    user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  // Debounce search input
  const debounceTimer = useMemo(() => {
    return {
      set: (val: string) => {
        const id = setTimeout(() => setDebouncedSearch(val), 300);
        return () => clearTimeout(id);
      },
    };
  }, []);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
    debounceTimer.set(val);
  }

  // Query
  const { data, isLoading, isError } = useAssets({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const deleteMutation = useDeleteAsset();

  const assets = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function handleEdit(asset: Asset) {
    setEditAsset(asset);
    setModalOpen(true);
  }

  function handleDelete(asset: Asset) {
    if (
      window.confirm(
        `Dispose asset "${asset.name}" (${asset.assetTag})? This will mark it as disposed.`
      )
    ) {
      deleteMutation.mutate(asset.id);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditAsset(null);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Asset Registration &amp; Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, search, and manage your organization&apos;s assets.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditAsset(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus size={16} />
            Add Asset
          </button>
        )}
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Search by name, tag, serial number..."
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tag
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Condition
                </th>
                {canManage && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: canManage ? 7 : 6 }).map(
                        (_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </>
              )}

              {isError && (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="px-4 py-12 text-center text-sm text-red-600"
                  >
                    Failed to load assets. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && assets.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="px-4 py-16 text-center"
                  >
                    <Boxes
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="text-sm font-medium text-slate-500">
                      No assets found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {search || statusFilter
                        ? "Try adjusting your search or filters."
                        : "Register your first asset to get started."}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-brand-600">
                      {asset.assetTag}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">
                        {asset.name}
                      </p>
                      {asset.serialNumber && (
                        <p className="text-xs text-slate-400">
                          S/N: {asset.serialNumber}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {asset.category?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        status={asset.status as AssetStatus}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {asset.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {asset.location}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {asset.condition || "—"}
                    </td>
                    {canManage && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(asset)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                            title="Edit asset"
                          >
                            <Pencil size={14} />
                          </button>
                          {user?.role === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(asset)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Dispose asset"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(page - 1) * ITEMS_PER_PAGE + 1}
              </span>
              –
              <span className="font-medium text-slate-700">
                {Math.min(page * ITEMS_PER_PAGE, total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{total}</span>{" "}
              assets
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-white disabled:opacity-40"
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
                className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-white disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AssetFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editAsset={editAsset}
      />
    </div>
  );
}
