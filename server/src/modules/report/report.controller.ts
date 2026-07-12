import { Request, Response, NextFunction } from "express";
import * as reportService from "./report.service";

export async function getDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await reportService.getDashboardMetrics();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
