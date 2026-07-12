import { z } from "zod";

export const createTransferSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  toUserId: z.string().min(1, "Transfer recipient is required"),
  reason: z.string().optional(),
});

export const transferQuerySchema = z.object({
  assetId: z.string().optional(),
  status: z.string().optional(),
  requestedById: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type TransferQuery = z.infer<typeof transferQuerySchema>;
