import { z } from "zod";

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1),
  issueDescription: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  technicianName: z.string().optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"]),
  issueDescription: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  technicianName: z.string().optional(),
});
