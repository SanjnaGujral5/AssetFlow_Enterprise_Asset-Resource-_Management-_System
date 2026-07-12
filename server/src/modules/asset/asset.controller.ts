import { Request, Response, NextFunction } from "express";
import * as assetService from "./asset.service";
import { assetQuerySchema } from "./asset.schema";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
}

export async function createBulk(req: Request, res: Response, next: NextFunction) {
  try {
    const assets = await assetService.createBulkAssets(req.body);
    res.status(201).json(assets);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = assetQuerySchema.parse(req.query);
    const result = await assetService.listAssets(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    res.status(200).json(asset);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    res.status(200).json(asset);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.deleteAsset(req.params.id);
    res.status(200).json(asset);
  } catch (err) {
    next(err);
  }
}
