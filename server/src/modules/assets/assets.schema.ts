import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().min(1),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  isBookable: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "LOST", "RETIRED", "DISPOSED"]).optional(),
});

export const assetQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional(),
});
