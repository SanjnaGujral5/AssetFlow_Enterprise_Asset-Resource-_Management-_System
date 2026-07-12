import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  headUserId: z.string().optional().or(z.literal("")),
  parentDepartmentId: z.string().optional().or(z.literal("")),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
