import { Router } from "express";
import * as auditController from "./audit.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createAuditCycleSchema } from "./audit.schema";

const router = Router();

router.use(authGuard);
router.use(roleGuard("ADMIN", "ASSET_MANAGER"));

// List audit cycles
router.get("/", auditController.list);

// Get cycle detail with items
router.get("/:id", auditController.getById);

// Get discrepancy report for a cycle
router.get("/:id/discrepancies", auditController.discrepancies);

// Create audit cycle
router.post(
  "/",
  validate(createAuditCycleSchema),
  auditController.create
);

// Close audit cycle
router.patch("/:id/close", auditController.close);

// Verify an audit item
router.patch("/items/:itemId/verify", auditController.verifyItem);

export default router;
