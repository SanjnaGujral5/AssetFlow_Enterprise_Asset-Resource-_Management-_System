import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";

interface AssetDetailData {
  id: string;
  assetTag: string;
  name: string;
  status: string;
  location?: string;
  condition?: string;
  category?: { name: string };
  allocations?: Array<{ id: string; status: string }>;
}

export function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState<AssetDetailData | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/assets/${id}`).then((res) => setAsset(res.data)).catch(() => setAsset(null));
  }, [id]);

  if (!asset) return <div className="text-sm text-slate-500">Loading asset details…</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{asset.assetTag}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{asset.name}</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Category</p>
            <p className="font-medium text-slate-900">{asset.category?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="font-medium text-slate-900">{asset.status}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Location</p>
            <p className="font-medium text-slate-900">{asset.location || "—"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Allocation history</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {(asset.allocations?.length ?? 0) > 0 ? (
            asset.allocations!.map((allocation) => (
              <li key={allocation.id} className="rounded-lg bg-slate-50 px-3 py-2">
                Allocation {allocation.id.slice(0, 8)} — {allocation.status}
              </li>
            ))
          ) : (
            <li>No allocation history yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
