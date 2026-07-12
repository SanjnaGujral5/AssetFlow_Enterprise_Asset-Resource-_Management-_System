import { Router } from "express";
import * as bookingController from "./booking.controller";
import { validate } from "../../middleware/validate";
import { authGuard } from "../../middleware/authGuard";
import { createBookingSchema } from "./booking.schema";

const router = Router();

router.use(authGuard);

// List bookable resources — all authenticated
router.get("/resources", bookingController.resources);

// List bookings — all authenticated
router.get("/", bookingController.list);

// Create booking — all authenticated
router.post("/", validate(createBookingSchema), bookingController.create);

// Cancel booking — booker or admin
router.patch("/:id/cancel", bookingController.cancel);

export default router;
