import { z } from "zod";

export const createAllocationSchema = z.object({
  assetId: z.string().min(1),
  holderUserId: z.string().optional(),
  holderDeptId: z.string().optional(),
  expectedReturnDate: z.string().optional(),
});

export const returnAllocationSchema = z.object({
  returnConditionNotes: z.string().optional(),
});
