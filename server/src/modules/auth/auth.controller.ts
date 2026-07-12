import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.signupEmployee(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
