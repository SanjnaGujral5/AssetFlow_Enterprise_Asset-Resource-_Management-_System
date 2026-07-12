import { Request, Response, NextFunction } from "express";
import * as departmentService from "./department.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentService.listDepartments();
    res.status(200).json(departments);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json(department);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
