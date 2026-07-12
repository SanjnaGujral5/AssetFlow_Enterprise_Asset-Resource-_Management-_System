import { Request, Response, NextFunction } from "express";
import * as auditService from "./audit.service";
import { verifyItemSchema } from "./audit.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const cycle = await auditService.createAuditCycle(
      req.body,
      req.user!.userId
    );
    res.status(201).json(cycle);
  } catch (err) {
    next(err);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const cycles = await auditService.listAuditCycles();
    res.status(200).json(cycles);
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cycle = await auditService.getAuditCycleDetail(req.params.id);
    res.status(200).json(cycle);
  } catch (err) {
    next(err);
  }
}

export async function verifyItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = verifyItemSchema.parse(req.body);
    const item = await auditService.verifyItem(
      req.params.itemId,
      input,
      req.user!.userId
    );
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

export async function close(req: Request, res: Response, next: NextFunction) {
  try {
    const cycle = await auditService.closeAuditCycle(req.params.id);
    res.status(200).json(cycle);
  } catch (err) {
    next(err);
  }
}

export async function discrepancies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const items = await auditService.getDiscrepancies(req.params.id);
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}
