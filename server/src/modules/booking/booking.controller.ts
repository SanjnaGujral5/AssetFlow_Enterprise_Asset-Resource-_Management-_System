import { Request, Response, NextFunction } from "express";
import * as bookingService from "./booking.service";
import { bookingQuerySchema } from "./booking.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking(
      req.body,
      req.user!.userId
    );
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = bookingQuerySchema.parse(req.query);
    const result = await bookingService.listBookings(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resources(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await bookingService.getBookableResources();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
