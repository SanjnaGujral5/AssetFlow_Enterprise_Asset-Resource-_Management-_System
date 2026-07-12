import { Router } from "express";
import * as transferController from "./transfers.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createTransferSchema, approveTransferSchema } from "./transfers.schema";

const router = Router();

router.post("/", authGuard, validate(createTransferSchema), transferController.request);
router.post("/:id/approve", authGuard, roleGuard("ADMIN", "ASSET_MANAGER", "DEPT_HEAD"), validate(approveTransferSchema), transferController.approve);

export default router;
