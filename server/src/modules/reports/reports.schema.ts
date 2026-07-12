import { z } from "zod";

export const dashboardQuerySchema = z.object({
  departmentId: z.string().optional(),
});

export const utilizationQuerySchema = z.object({
  departmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
