import { Router } from "express";
import * as reportController from "./report.controller";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";

const router = Router();

router.use(authGuard);

// Reports are restricted to management roles
router.get(
  "/dashboard",
  roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"),
  reportController.getDashboard
);

export default router;
