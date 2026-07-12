import { Router } from "express";
import { validate } from "../../middleware/validate";
import * as schema from "./bookings.schema";
import * as controller from "./bookings.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.use(authGuard);
router.get("/", controller.getBookings);
router.post("/", validate(schema.createBookingSchema), controller.postBooking);
router.patch("/:id", validate(schema.rescheduleBookingSchema), controller.patchBooking);
router.delete("/:id", controller.deleteBooking);

export default router;
