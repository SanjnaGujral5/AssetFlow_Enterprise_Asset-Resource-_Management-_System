import { Router } from "express";
import * as notificationController from "./notification.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.use(authGuard);

// Get unread count
router.get("/unread-count", notificationController.unreadCount);

// List notifications
router.get("/", notificationController.list);

// Mark all as read
router.patch("/read-all", notificationController.markAllRead);

// Mark specific as read
router.patch("/:id/read", notificationController.markRead);

export default router;
