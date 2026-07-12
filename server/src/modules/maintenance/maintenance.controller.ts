import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "./maintenance.service";
import { maintenanceQuerySchema, updateStatusSchema } from "./maintenance.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await maintenanceService.createRequest(
      req.body,
      req.user!.userId
    );
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateStatusSchema.parse(req.body);
    const request = await maintenanceService.updateStatus(
      req.params.id,
      input,
      req.user!.userId
    );
    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = maintenanceQuerySchema.parse(req.query);
    const result = await maintenanceService.listRequests(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function kanban(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const columns = await maintenanceService.getKanbanView();
    res.status(200).json(columns);
  } catch (err) {
    next(err);
  }
}
