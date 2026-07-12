import { Router } from "express";
import * as assetController from "./assets.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createAssetSchema, assetQuerySchema } from "./assets.schema";

const router = Router();

router.get("/", authGuard, assetController.listAssets);
router.get("/:id", authGuard, assetController.getAsset);
router.post("/", authGuard, roleGuard("ADMIN", "ASSET_MANAGER"), validate(createAssetSchema), assetController.createAsset);

export default router;
