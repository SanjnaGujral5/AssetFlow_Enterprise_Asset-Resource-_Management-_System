import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";

interface AssetItem {
  id: string;
  assetTag: string;
  name: string;
  status: string;
  category: { name: string };
}

export function AssetList() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient.get("/assets").then((res) => setAssets(res.data)).catch(() => setAssets([]));
  }, []);

  const filtered = assets.filter((asset) =>
    `${asset.assetTag} ${asset.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Asset Registry</h1>
          <p className="text-sm text-slate-500">Register, search, and review assets with their lifecycle state.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by tag or name"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Tag</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((asset) => (
              <tr key={asset.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{asset.assetTag}</td>
                <td className="px-4 py-3">
                  <Link to={`/assets/${asset.id}`} className="text-brand-600 hover:underline">
                    {asset.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{asset.category?.name}</td>
                <td className="px-4 py-3 text-slate-600">{asset.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
