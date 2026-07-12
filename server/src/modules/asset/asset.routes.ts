import { Router } from "express";
import * as assetController from "./asset.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createAssetSchema, updateAssetSchema, bulkCreateAssetSchema } from "./asset.schema";

const router = Router();

// All asset routes require authentication
router.use(authGuard);

// List & get are available to all authenticated users
router.get("/", assetController.list);
router.get("/:id", assetController.getById);

// Create & update restricted to ADMIN and ASSET_MANAGER
router.post(
  "/",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  validate(createAssetSchema),
  assetController.create
);

router.post(
  "/bulk",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  validate(bulkCreateAssetSchema),
  assetController.createBulk
);

router.patch(
  "/:id",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  validate(updateAssetSchema),
  assetController.update
);

// Delete restricted to ADMIN only
router.delete(
  "/:id",
  roleGuard("ADMIN"),
  assetController.remove
);

export default router;
