import { Router } from "express";
import * as userController from "./user.controller";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";

const router = Router();

router.use(authGuard);

// List active users — any authenticated user (for dropdowns)
router.get("/", userController.list);

// Only ADMIN can change roles/departments
router.patch("/:id/role-dept", roleGuard("ADMIN"), userController.updateRoleDept);

export default router;
