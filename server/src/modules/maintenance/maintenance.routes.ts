import { Router } from "express";
import * as maintenanceController from "./maintenance.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createMaintenanceSchema } from "./maintenance.schema";

const router = Router();

router.use(authGuard);

// Kanban view — all authenticated
router.get("/kanban", maintenanceController.kanban);

// List — all authenticated
router.get("/", maintenanceController.list);

// Raise request — any authenticated user
router.post(
  "/",
  validate(createMaintenanceSchema),
  maintenanceController.create
);

// Update status — ADMIN, ASSET_MANAGER only
router.patch(
  "/:id/status",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  maintenanceController.updateStatus
);

export default router;
