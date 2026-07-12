import { useState } from "react";
import { apiClient } from "../../lib/apiClient";

export function AllocationBoard() {
  const [assetId, setAssetId] = useState("");
  const [holderUserId, setHolderUserId] = useState("");
  const [holderDeptId, setHolderDeptId] = useState("");
  const [message, setMessage] = useState("");

  async function handleAllocate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post("/allocations", { assetId, holderUserId, holderDeptId });
      setMessage("Allocation created successfully.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Allocation failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Allocation & Transfer</h1>
        <p className="text-sm text-slate-500">Create allocations and guard against double-allocation conflicts.</p>
      </div>

      <form onSubmit={handleAllocate} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <input
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          placeholder="Asset ID"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={holderUserId}
          onChange={(e) => setHolderUserId(e.target.value)}
          placeholder="Holder user ID"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={holderDeptId}
          onChange={(e) => setHolderDeptId(e.target.value)}
          placeholder="Holder department ID"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white" type="submit">
          Allocate asset
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </div>
  );
}
