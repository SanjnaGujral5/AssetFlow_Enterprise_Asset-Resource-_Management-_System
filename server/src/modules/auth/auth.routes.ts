import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { signupSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authGuard, authController.me);

export default router;
