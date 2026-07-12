import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  assetTag: z.string().min(1, "Asset tag is required"),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(), // ISO date string
  acquisitionCost: z.number().min(0).optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  isBookable: z.boolean().optional(),
});

export const bulkCreateAssetSchema = z.array(createAssetSchema).min(1).max(500);

export const updateAssetSchema = createAssetSchema.partial();

export const assetQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;
