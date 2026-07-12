import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import * as reportsController from "./reports.controller";

const router = Router();

router.use(authGuard);
router.get("/kpis", roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), reportsController.getKpis);
router.get("/maintenance-frequency", roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), reportsController.getMaintenanceFrequency);
router.get("/booking-heatmap", roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), reportsController.getBookingHeatmap);
router.get("/department-summary", roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), reportsController.getDepartmentSummary);
router.get("/activity-log", roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), reportsController.getActivityLog);

export default router;
