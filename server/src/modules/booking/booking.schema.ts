import { z } from "zod";

export const createBookingSchema = z.object({
  resourceAssetId: z.string().min(1, "Resource is required"),
  startTime: z.string().min(1, "Start time is required"), // ISO datetime
  endTime: z.string().min(1, "End time is required"), // ISO datetime
  departmentId: z.string().optional(),
});

export const bookingQuerySchema = z.object({
  resourceAssetId: z.string().optional(),
  bookedById: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(), // ISO date to filter bookings for a specific day
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
