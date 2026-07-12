import { Request, Response, NextFunction } from "express";
import * as reportsService from "./reports.service";

export async function getKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getDashboardKpis(req.query.departmentId as string | undefined);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceFrequency(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getMaintenanceFrequency();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getBookingHeatmap(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getBookingHeatmap(
      req.query.startDate as string | undefined,
      req.query.endDate as string | undefined
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getDepartmentSummary();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getActivityLog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportsService.getActivityLog();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
