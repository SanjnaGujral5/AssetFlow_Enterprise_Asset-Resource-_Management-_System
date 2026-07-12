import { z } from "zod";

export const notificationQuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
