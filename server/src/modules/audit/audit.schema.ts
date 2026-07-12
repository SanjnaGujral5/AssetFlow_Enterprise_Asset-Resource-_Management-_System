import { z } from "zod";

export const createAuditCycleSchema = z.object({
  scopeDepartmentId: z.string().optional(),
  scopeLocation: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const verifyItemSchema = z.object({
  result: z.enum(["VERIFIED", "MISSING", "DAMAGED"]),
  notes: z.string().optional(),
});

export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>;
export type VerifyItemInput = z.infer<typeof verifyItemSchema>;
