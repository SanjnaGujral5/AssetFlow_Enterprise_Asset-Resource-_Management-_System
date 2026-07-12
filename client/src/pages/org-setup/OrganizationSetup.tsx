import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { Department, User } from "../../types";

export function OrganizationSetup() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [selectedDepartmentForUser, setSelectedDepartmentForUser] = useState<Record<string, string>>({});
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [departmentRes, userRes] = await Promise.all([
        apiClient.get("/organization/departments"),
        apiClient.get("/organization/users"),
      ]);
      setDepartments(departmentRes.data);
      setUsers(userRes.data);
      setSelectedDepartmentForUser(
        userRes.data.reduce((acc: Record<string, string>, user: User) => {
          acc[user.id] = user.departmentId || "";
          return acc;
        }, {})
      );
      setSelectedRoleForUser(
        userRes.data.reduce((acc: Record<string, string>, user: User) => {
          acc[user.id] = user.role;
          return acc;
        }, {})
      );
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to load organization data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateDepartment(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!newDepartmentName.trim()) {
      setMessage("Department name is required.");
      return;
    }

    try {
      await apiClient.post("/organization/departments", { name: newDepartmentName });
      setNewDepartmentName("");
      await loadData();
      setMessage("Department created successfully.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to create department.");
    }
  }

  async function handleUpdateUser(userId: string) {
    setMessage("");
    try {
      await apiClient.patch(`/organization/users/${userId}`, {
        role: selectedRoleForUser[userId],
        departmentId: selectedDepartmentForUser[userId] || null,
      });
      await loadData();
      setMessage("Employee updated successfully.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Unable to update employee.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Organization Setup</h1>
        <p className="text-sm text-slate-500">Manage departments and employee assignments for your organization.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create Department</h2>
          <p className="mt-1 text-sm text-slate-500">Add a new department to your organization structure.</p>

          <form className="mt-4 space-y-3" onSubmit={handleCreateDepartment}>
            <input
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="New department name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white" type="submit">
              Create department
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Department Directory</h2>
          <p className="mt-1 text-sm text-slate-500">View departments and head assignments.</p>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading departments…</p>
          ) : departments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No departments yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {departments.map((department) => (
                <div key={department.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{department.name}</p>
                      <p className="text-xs text-slate-500">Status: {department.status}</p>
                    </div>
                    <span className="text-sm text-slate-500">Head: {department.headUser?.name || "Unassigned"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Employee Directory</h2>
            <p className="text-sm text-slate-500">Promote employees and assign departments.</p>
          </div>
          <span className="text-sm text-slate-500">{loading ? "Refreshing…" : `${users.length} employees`}</span>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading employees…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={selectedDepartmentForUser[user.id] || ""}
                        onChange={(e) =>
                          setSelectedDepartmentForUser((prev) => ({ ...prev, [user.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      >
                        <option value="">Unassigned</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={selectedRoleForUser[user.id] || user.role}
                        onChange={(e) =>
                          setSelectedRoleForUser((prev) => ({ ...prev, [user.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="DEPT_HEAD">Department Head</option>
                        <option value="ASSET_MANAGER">Asset Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdateUser(user.id)}
                        className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
