import { Router } from "express";
import { validate } from "../../middleware/validate";
import * as schema from "./maintenance.schema";
import * as controller from "./maintenance.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.use(authGuard);
router.get("/", controller.getMaintenanceTasks);
router.post("/", validate(schema.createMaintenanceSchema), controller.postMaintenanceTask);
router.patch("/:id", validate(schema.updateMaintenanceSchema), controller.patchMaintenanceTask);

export default router;
