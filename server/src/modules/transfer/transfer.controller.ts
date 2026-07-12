import { Request, Response, NextFunction } from "express";
import * as transferService from "./transfer.service";
import { transferQuerySchema } from "./transfer.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const transfer = await transferService.createTransfer(
      req.body,
      req.user!.userId
    );
    res.status(201).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const transfer = await transferService.approveTransfer(
      req.params.id,
      req.user!.userId
    );
    res.status(200).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const transfer = await transferService.rejectTransfer(
      req.params.id,
      req.user!.userId
    );
    res.status(200).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = transferQuerySchema.parse(req.query);
    const result = await transferService.listTransfers(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
