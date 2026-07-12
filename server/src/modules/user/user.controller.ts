import { Request, Response, NextFunction } from "express";
import * as userService from "./user.service";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listActiveUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateRoleDept(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserRoleAndDept(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
