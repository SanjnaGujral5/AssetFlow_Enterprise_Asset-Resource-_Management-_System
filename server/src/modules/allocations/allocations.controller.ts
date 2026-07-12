import { Request, Response, NextFunction } from "express";
import * as allocationService from "./allocations.service";

export async function allocate(req: Request, res: Response, next: NextFunction) {
  try {
    const allocation = await allocationService.allocateAsset(req.body);
    res.status(201).json(allocation);
  } catch (err) {
    next(err);
  }
}

export async function returnAllocation(req: Request, res: Response, next: NextFunction) {
  try {
    await allocationService.returnAsset(req.params.id, req.body);
    res.status(200).json({ message: "Asset returned successfully" });
  } catch (err) {
    next(err);
  }
}
