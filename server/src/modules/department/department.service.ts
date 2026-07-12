import { prisma } from "../../lib/prisma";
import { CreateDepartmentInput, UpdateDepartmentInput } from "./department.schema";

const INCLUDE = {
  headUser: { select: { id: true, name: true, email: true } },
  parentDepartment: { select: { id: true, name: true } },
  _count: { select: { employees: true } },
};

export async function createDepartment(input: CreateDepartmentInput) {
  const existing = await prisma.department.findUnique({
    where: { name: input.name },
  });

  if (existing) {
    const err: any = new Error("Department with this name already exists");
    err.status = 409;
    throw err;
  }

  return prisma.department.create({
    data: {
      name: input.name,
      headUserId: input.headUserId || undefined,
      parentDepartmentId: input.parentDepartmentId || undefined,
    },
    include: INCLUDE,
  });
}

export async function listDepartments() {
  return prisma.department.findMany({
    include: INCLUDE,
    orderBy: { name: "asc" },
  });
}

export async function updateDepartment(id: string, input: UpdateDepartmentInput) {
  const department = await prisma.department.findUnique({ where: { id } });

  if (!department) {
    const err: any = new Error("Department not found");
    err.status = 404;
    throw err;
  }

  return prisma.department.update({
    where: { id },
    data: {
      name: input.name,
      headUserId: input.headUserId || null,
      parentDepartmentId: input.parentDepartmentId || null,
    },
    include: INCLUDE,
  });
}

export async function deleteDepartment(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true, childDepartments: true } } },
  });

  if (!department) {
    const err: any = new Error("Department not found");
    err.status = 404;
    throw err;
  }

  if (department._count.employees > 0) {
    const err: any = new Error("Cannot delete department with active employees");
    err.status = 400;
    throw err;
  }

  if (department._count.childDepartments > 0) {
    const err: any = new Error("Cannot delete department with child departments");
    err.status = 400;
    throw err;
  }

  return prisma.department.delete({ where: { id } });
}
