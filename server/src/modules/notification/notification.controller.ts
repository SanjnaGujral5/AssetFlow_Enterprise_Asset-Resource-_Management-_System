import { Request, Response, NextFunction } from "express";
import * as notificationService from "./notification.service";
import { notificationQuerySchema } from "./notification.schema";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = notificationQuerySchema.parse(req.query);
    const result = await notificationService.getUserNotifications(
      req.user!.userId,
      query
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.getUnreadCount(req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markAsRead(
      req.params.id,
      req.user!.userId
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
