export type Role = "EMPLOYEE" | "DEPT_HEAD" | "ASSET_MANAGER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
