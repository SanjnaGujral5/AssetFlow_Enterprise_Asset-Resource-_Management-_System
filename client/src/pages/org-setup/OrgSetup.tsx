import { useState } from "react";
import { Building2, Users, Plus, ShieldAlert } from "lucide-react";
import { useDepartments, useCreateDepartment } from "../../features/departments/useDepartments";
import { useUsers, useUpdateUserRoleDept } from "../../features/users/useUsers";
import { Role } from "../../types";
import { useAuthStore } from "../../store/authStore";

const ROLES: Role[] = ["EMPLOYEE", "DEPT_HEAD", "ASSET_MANAGER", "ADMIN"];

export function OrgSetup() {
  const [activeTab, setActiveTab] = useState<"departments" | "users">("departments");
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <ShieldAlert size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-900">Access Restricted</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Only system administrators can access the Organization Setup dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Organization Setup</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage departments and assign user roles.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "departments"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 size={18} />
          Departments
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users size={18} />
          Users & Roles
        </button>
      </div>

      {activeTab === "departments" ? <DepartmentsTab /> : <UsersTab />}
    </div>
  );
}

function DepartmentsTab() {
  const { data: departments, isLoading } = useDepartments();
  const createDept = useCreateDepartment();
  const [isCreating, setIsCreating] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await createDept.mutateAsync({ name: newDeptName });
    setNewDeptName("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} />
          New Department
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            autoFocus
            placeholder="Department Name (e.g. Engineering)"
            className="flex-1 rounded-lg border-slate-200 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
          />
          <button
            type="submit"
            disabled={createDept.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
              </tr>
            ) : departments?.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No departments found.</td>
              </tr>
            ) : (
              departments?.map((dept) => (
                <tr key={dept.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{dept.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{dept._count?.employees || 0}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const updateRoleDept = useUpdateUserRoleDept();

  const handleUpdate = (userId: string, field: "role" | "departmentId", value: string) => {
    updateRoleDept.mutate({ id: userId, [field]: value });
  };

  if (usersLoading || deptsLoading) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading users...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Department</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users?.map((u) => (
            <tr key={u.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={u.role}
                  onChange={(e) => handleUpdate(u.id, "role", e.target.value)}
                  className="rounded-lg border-slate-200 text-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role.replace("_", " ")}</option>
                  ))}
                </select>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={u.departmentId || ""}
                  onChange={(e) => handleUpdate(u.id, "departmentId", e.target.value)}
                  className="rounded-lg border-slate-200 text-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">Unassigned</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
