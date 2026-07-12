import { Request, Response, NextFunction } from "express";
import * as allocationService from "./allocation.service";
import { allocationQuerySchema, returnAllocationSchema } from "./allocation.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const allocation = await allocationService.allocateAsset(req.body);
    res.status(201).json(allocation);
  } catch (err) {
    next(err);
  }
}

export async function returnAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const input = returnAllocationSchema.parse(req.body);
    const allocation = await allocationService.returnAsset(req.params.id, input);
    res.status(200).json(allocation);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = allocationQuerySchema.parse(req.query);
    const result = await allocationService.listAllocations(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
