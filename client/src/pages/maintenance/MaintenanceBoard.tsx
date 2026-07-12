import { useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { formatLocalDate, formatLocalTime } from "../../lib/dateOverlap";

interface MaintenanceTask {
  id: string;
  assetId: string;
  issueDescription: string;
  priority: string;
  status: string;
  technicianName?: string | null;
  createdAt: string;
  asset: { name: string } | null;
}

export function MaintenanceBoard() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [assetId, setAssetId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [technicianName, setTechnicianName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    setMessage("");
    try {
      const response = await apiClient.get("/maintenance?mine=true");
      setTasks(response.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to load maintenance tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!assetId || !issueDescription) {
      setMessage("Asset and issue description are required.");
      return;
    }

    try {
      await apiClient.post("/maintenance", {
        assetId,
        issueDescription,
        priority,
        technicianName: technicianName || undefined,
        photoUrl: photoUrl || undefined,
      });
      setMessage("Maintenance request created successfully.");
      setAssetId("");
      setIssueDescription("");
      setPriority("MEDIUM");
      setTechnicianName("");
      setPhotoUrl("");
      await loadTasks();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Maintenance request failed.");
    }
  }

  async function updateTaskStatus(id: string, status: string) {
    try {
      await apiClient.patch(`/maintenance/${id}`, { status });
      await loadTasks();
      setMessage(`Task updated to ${status}.`);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maintenance Requests</h1>
          <p className="text-sm text-slate-500">Raise issues and track maintenance status with a history table.</p>
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
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Issue description"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={4}
          />
        </div>

        <div className="grid gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
            placeholder="Technician name (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Photo URL (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white" type="submit">
            Submit maintenance request
          </button>
        </div>
      </form>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Maintenance History</h2>
          <span className="text-sm text-slate-500">{loading ? "Refreshing..." : `${tasks.length} tasks`}</span>
        </div>

        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-700">
          <thead>
            <tr>
              <th className="px-3 py-2 text-slate-500">Asset</th>
              <th className="px-3 py-2 text-slate-500">Issue</th>
              <th className="px-3 py-2 text-slate-500">Priority</th>
              <th className="px-3 py-2 text-slate-500">Technician</th>
              <th className="px-3 py-2 text-slate-500">Status</th>
              <th className="px-3 py-2 text-slate-500">Created</th>
              <th className="px-3 py-2 text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-900">{task.asset?.name || task.assetId}</td>
                <td className="px-3 py-3">{task.issueDescription}</td>
                <td className="px-3 py-3">{task.priority}</td>
                <td className="px-3 py-3">{task.technicianName || "Unassigned"}</td>
                <td className="px-3 py-3">{task.status}</td>
                <td className="px-3 py-3">{formatLocalDate(task.createdAt)} {formatLocalTime(task.createdAt)}</td>
                <td className="px-3 py-3 space-x-2">
                  {task.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => updateTaskStatus(task.id, "APPROVED")}
                        className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, "REJECTED")}
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  {task.status === "APPROVED" ? (
                    <button
                      onClick={() => updateTaskStatus(task.id, "TECHNICIAN_ASSIGNED")}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-semibold text-white"
                    >
                      Assign
                    </button>
                  ) : null}
                  {task.status === "TECHNICIAN_ASSIGNED" ? (
                    <button
                      onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                      className="rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white"
                    >
                      Start
                    </button>
                  ) : null}
                  {task.status === "IN_PROGRESS" ? (
                    <button
                      onClick={() => updateTaskStatus(task.id, "RESOLVED")}
                      className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                    >
                      Resolve
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
