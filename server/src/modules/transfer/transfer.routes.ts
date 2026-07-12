import { Router } from "express";
import * as transferController from "./transfer.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createTransferSchema } from "./transfer.schema";

const router = Router();

router.use(authGuard);

// List transfers — all authenticated users
router.get("/", transferController.list);

// Create transfer request — any authenticated user can request
router.post("/", validate(createTransferSchema), transferController.create);

// Approve/reject — ADMIN, ASSET_MANAGER, DEPT_HEAD
router.patch(
  "/:id/approve",
  roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"),
  transferController.approve
);

router.patch(
  "/:id/reject",
  roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"),
  transferController.reject
);

export default router;
