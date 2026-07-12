import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

const router = Router();

// All category routes require authentication
router.use(authGuard);

// List categories — available to all authenticated users (for dropdowns)
router.get("/", categoryController.list);
router.get("/:id", categoryController.getById);

// Create & update restricted to ADMIN and ASSET_MANAGER
router.post(
  "/",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  validate(createCategorySchema),
  categoryController.create
);

router.patch(
  "/:id",
  roleGuard("ADMIN", "ASSET_MANAGER"),
  validate(updateCategorySchema),
  categoryController.update
);

export default router;
