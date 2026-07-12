import { prisma } from "../../lib/prisma";
import { recordActivity } from "../../lib/activityLogger";
import { Role } from "@prisma/client";

export async function listDepartments(query: { search?: string }) {
  const where: any = {};
  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  return prisma.department.findMany({
    where,
    include: { headUser: true, childDepartments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDepartment(input: { name: string; parentDepartmentId?: string | null }, actorUserId: string) {
  const department = await prisma.department.create({
    data: {
      name: input.name,
      parentDepartmentId: input.parentDepartmentId || undefined,
    },
    include: { headUser: true, childDepartments: true },
  });

  await recordActivity(actorUserId, "Created department", "Department", department.id, {
    name: department.name,
    parentDepartmentId: department.parentDepartmentId,
  });

  return department;
}

export async function updateDepartment(
  departmentId: string,
  input: {
    name?: string;
    status?: "ACTIVE" | "INACTIVE";
    headUserId?: string | null;
    parentDepartmentId?: string | null;
  },
  actorUserId: string
) {
  const data: any = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.status !== undefined) data.status = input.status;
  if (input.headUserId !== undefined) data.headUserId = input.headUserId || null;
  if (input.parentDepartmentId !== undefined) data.parentDepartmentId = input.parentDepartmentId || null;

  const department = await prisma.department.update({
    where: { id: departmentId },
    data,
    include: { headUser: true, childDepartments: true },
  });

  await recordActivity(actorUserId, "Updated department", "Department", department.id, data);

  return department;
}

export async function listUsers(query: { search?: string; departmentId?: string }) {
  const where: any = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUser(
  userId: string,
  input: { role?: Role; departmentId?: string | null },
  actorUserId: string
) {
  const data: any = {};
  if (input.role !== undefined) data.role = input.role;
  if (input.departmentId !== undefined) data.departmentId = input.departmentId || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const sanitizedUser = sanitizeUser(user);

  await recordActivity(actorUserId, "Updated employee profile", "User", user.id, {
    role: sanitizedUser.role,
    departmentId: sanitizedUser.departmentId,
  });

  return sanitizedUser;
}

function sanitizeUser(user: any) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
