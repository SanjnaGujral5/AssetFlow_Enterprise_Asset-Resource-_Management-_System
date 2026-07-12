import { z } from "zod";

export const createTransferSchema = z.object({
  assetId: z.string().min(1),
  toUserId: z.string().min(1),
});

export const approveTransferSchema = z.object({
  approved: z.boolean(),
});
