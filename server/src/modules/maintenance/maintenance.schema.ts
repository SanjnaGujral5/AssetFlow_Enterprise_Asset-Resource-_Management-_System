import { z } from "zod";

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issueDescription: z.string().min(5, "Please describe the issue (min 5 characters)"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "TECHNICIAN_ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
  ]),
  technicianName: z.string().optional(),
});

export const maintenanceQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assetId: z.string().optional(),
  raisedById: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type MaintenanceQuery = z.infer<typeof maintenanceQuerySchema>;
