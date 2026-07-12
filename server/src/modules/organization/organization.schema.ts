import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  parentDepartmentId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  headUserId: z.string().optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(["EMPLOYEE", "DEPT_HEAD", "ASSET_MANAGER", "ADMIN"]).optional(),
  departmentId: z.string().optional().nullable(),
});
