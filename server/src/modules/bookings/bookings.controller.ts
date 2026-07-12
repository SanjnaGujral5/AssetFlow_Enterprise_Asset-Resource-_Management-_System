import { Request, Response, NextFunction } from "express";
import * as bookingsService from "./bookings.service";

export async function getBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const bookings = await bookingsService.listBookings({
      mine: req.query.mine as string | undefined,
      userId: (req.user as any)?.id,
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function postBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.createBooking({
      ...req.body,
      bookedById: (req.user as any).id,
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function deleteBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.cancelBooking(req.params.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function patchBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.rescheduleBooking(req.params.id, req.body);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}
