import { Router } from "express";
import * as allocationController from "./allocation.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createAllocationSchema } from "./allocation.schema";

const router = Router();

router.use(authGuard);

// List allocations — available to all authenticated users
router.get("/", allocationController.list);

// Allocate asset — restricted to ADMIN, ASSET_MANAGER, DEPT_HEAD
router.post(
  "/",
  roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"),
  validate(createAllocationSchema),
  allocationController.create
);

// Return asset — restricted to ADMIN, ASSET_MANAGER, DEPT_HEAD
router.patch(
  "/:id/return",
  roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"),
  allocationController.returnAsset
);

export default router;
