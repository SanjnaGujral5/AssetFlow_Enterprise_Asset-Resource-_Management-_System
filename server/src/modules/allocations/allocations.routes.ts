import { Router } from "express";
import * as allocationController from "./allocations.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createAllocationSchema, returnAllocationSchema } from "./allocations.schema";

const router = Router();

router.post("/", authGuard, roleGuard("ADMIN", "ASSET_MANAGER"), validate(createAllocationSchema), allocationController.allocate);
router.post("/:id/return", authGuard, roleGuard("ADMIN", "ASSET_MANAGER"), validate(returnAllocationSchema), allocationController.returnAllocation);

export default router;
