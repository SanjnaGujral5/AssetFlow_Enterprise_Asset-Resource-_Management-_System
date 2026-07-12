import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { validate } from "../../middleware/validate";
import * as organizationController from "./organization.controller";
import * as schema from "./organization.schema";

const router = Router();

router.use(authGuard, roleGuard("ADMIN"));

router.get("/departments", organizationController.listDepartments);
router.post("/departments", validate(schema.createDepartmentSchema), organizationController.createDepartment);
router.patch("/departments/:id", validate(schema.updateDepartmentSchema), organizationController.updateDepartment);

router.get("/users", organizationController.listUsers);
router.patch("/users/:id", validate(schema.updateUserSchema), organizationController.updateUser);

export default router;
