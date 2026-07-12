import { z } from "zod";

export const createBookingSchema = z.object({
  resourceAssetId: z.string().min(1),
  departmentId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
