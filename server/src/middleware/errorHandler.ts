import { Request, Response, NextFunction } from "express";

// Catch-all error handler. Controllers should call next(err) on failure
// rather than throwing directly inside async handlers.
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Something went wrong on the server";

  res.status(status).json({ message });
}
