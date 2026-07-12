import { Request, Response, NextFunction } from "express";
import * as assetService from "./assets.service";

export async function listAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const assets = await assetService.listAssets(req.query as any);
    res.status(200).json(assets);
  } catch (err) {
    next(err);
  }
}

export async function getAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    res.status(200).json(asset);
  } catch (err) {
    next(err);
  }
}

export async function createAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
}
