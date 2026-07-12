import { Request, Response, NextFunction } from "express";
import * as organizationService from "./organization.service";

export async function listDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await organizationService.listDepartments({
      search: req.query.search as string | undefined,
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await organizationService.createDepartment(req.body, (req.user as any).userId);
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await organizationService.updateDepartment(req.params.id, req.body, (req.user as any).userId);
    res.json(department);
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await organizationService.listUsers({
      search: req.query.search as string | undefined,
      departmentId: req.query.departmentId as string | undefined,
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await organizationService.updateUser(req.params.id, req.body, (req.user as any).userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
