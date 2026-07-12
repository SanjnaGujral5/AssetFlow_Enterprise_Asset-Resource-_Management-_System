import { z } from "zod";

export const createAllocationSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  holderUserId: z.string().min(1, "Holder user is required"),
  holderDeptId: z.string().optional(),
  expectedReturnDate: z.string().optional(), // ISO date string
});

export const returnAllocationSchema = z.object({
  returnConditionNotes: z.string().optional(),
});

export const allocationQuerySchema = z.object({
  assetId: z.string().optional(),
  holderUserId: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type ReturnAllocationInput = z.infer<typeof returnAllocationSchema>;
export type AllocationQuery = z.infer<typeof allocationQuerySchema>;
