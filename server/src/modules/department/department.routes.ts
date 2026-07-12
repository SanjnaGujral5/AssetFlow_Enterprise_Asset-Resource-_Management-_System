import { Router } from "express";
import * as departmentController from "./department.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { roleGuard } from "../../middleware/roleGuard";
import { createDepartmentSchema, updateDepartmentSchema } from "./department.schema";

const router = Router();

router.use(authGuard);

// Everyone authenticated can list departments
router.get("/", departmentController.list);

// Only ADMIN can modify departments
router.use(roleGuard("ADMIN"));

router.post("/", validate(createDepartmentSchema), departmentController.create);
router.patch("/:id", validate(updateDepartmentSchema), departmentController.update);
router.delete("/:id", departmentController.remove);

export default router;
