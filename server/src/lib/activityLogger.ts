import { prisma } from "./prisma";

export async function recordActivity(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  return prisma.activityLog.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      metadata: metadata && Object.keys(metadata).length ? metadata : undefined,
    },
  });
}
