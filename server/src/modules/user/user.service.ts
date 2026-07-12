import { prisma } from "../../lib/prisma";

export async function listActiveUsers() {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}

export async function updateUserRoleAndDept(
  userId: string,
  input: { role?: string; departmentId?: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: input.role as any || undefined,
      departmentId: input.departmentId === "" ? null : input.departmentId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
    },
  });
}
