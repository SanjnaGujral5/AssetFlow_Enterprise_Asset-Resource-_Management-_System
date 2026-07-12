import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "./maintenance.service";

export async function getMaintenanceTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await maintenanceService.listMaintenanceTasks({
      mine: req.query.mine as string | undefined,
      userId: (req.user as any)?.id,
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function postMaintenanceTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await maintenanceService.createMaintenanceTask({
      ...req.body,
      raisedById: (req.user as any).id,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function patchMaintenanceTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await maintenanceService.updateMaintenanceTask(req.params.id, {
      ...req.body,
      approvedById: (req.user as any).id,
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
}
