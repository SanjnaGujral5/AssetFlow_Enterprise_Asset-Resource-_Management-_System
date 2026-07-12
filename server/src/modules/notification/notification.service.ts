import { prisma } from "../../lib/prisma";
import { NotificationQuery } from "./notification.schema";
import { Prisma } from "@prisma/client";

export async function getUserNotifications(userId: string, query: NotificationQuery) {
  const { unreadOnly, page, limit } = query;

  const where: Prisma.NotificationWhereInput = {
    userId,
  };

  if (unreadOnly === "true") {
    where.isRead = false;
  }

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    const err: any = new Error("Notification not found");
    err.status = 404;
    throw err;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  
  return { count: result.count };
}

// Utility function to be used by other modules to create notifications
export async function createNotification(data: {
  userId: string;
  type: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}) {
  return prisma.notification.create({
    data: {
      ...data,
      isRead: false,
    },
  });
}
