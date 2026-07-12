import { Request, Response, NextFunction } from "express";
import * as transferService from "./transfers.service";

export async function request(req: Request, res: Response, next: NextFunction) {
  try {
    const transfer = await transferService.requestTransfer({
      assetId: req.body.assetId,
      toUserId: req.body.toUserId,
      requestedById: req.user!.userId,
    });
    res.status(201).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const transfer = await transferService.approveTransfer(req.params.id, req.body.approved);
    res.status(200).json(transfer);
  } catch (err) {
    next(err);
  }
}
