import { prisma } from "../../lib/prisma";

export async function getDashboardKpis(departmentId?: string) {
  const departmentClause: any = {};

  if (departmentId) {
    departmentClause.currentHolderDeptId = departmentId;
  }

  const [available, allocated, maintenanceToday, activeBookings, pendingTransfers, upcomingReturns] = await Promise.all([
    prisma.asset.count({ where: { status: "AVAILABLE", ...departmentClause } }),
    prisma.asset.count({ where: { status: "ALLOCATED", ...departmentClause } }),
    prisma.maintenanceRequest.count({
      where: {
        status: "IN_PROGRESS",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
        ...(departmentId ? { departmentId } : {}),
      },
    }),
    prisma.transferRequest.count({
      where: {
        status: "REQUESTED",
        ...(departmentId ? { toUser: { departmentId } } : {}),
      },
    }),
    prisma.allocation.count({
      where: {
        status: "ACTIVE",
        expectedReturnDate: { gte: new Date() },
        ...(departmentId ? { holderDeptId: departmentId } : {}),
      },
    }),
  ]);

  return {
    available,
    allocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
  };
}

export async function getMaintenanceFrequency() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const frequency = await prisma.maintenanceRequest.groupBy({
    by: ["priority", "status"],
    where: { createdAt: { gte: oneMonthAgo } },
    _count: { id: true },
  });

  return frequency;
}

export async function getBookingHeatmap(startDate?: string, endDate?: string) {
  const from = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
  const to = endDate ? new Date(endDate) : new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { gte: from },
      endTime: { lte: to },
    },
    select: { startTime: true, resourceAssetId: true },
  });

  return bookings.map((booking) => ({
    resourceAssetId: booking.resourceAssetId,
    date: booking.startTime.toISOString().slice(0, 10),
  }));
}

export async function getDepartmentSummary() {
  const departments = await prisma.department.findMany({
    include: {
      employees: true,
    },
  });

  const assetCounts = await prisma.asset.groupBy({
    by: ["currentHolderDeptId"],
    _count: { id: true },
  });

  const assetCountByDept = assetCounts.reduce((acc, item) => {
    if (item.currentHolderDeptId) {
      acc[item.currentHolderDeptId] = item._count.id;
    }
    return acc;
  }, {} as Record<string, number>);

  return departments.map((department) => ({
    departmentId: department.id,
    name: department.name,
    employeeCount: department.employees.length,
    assetCount: assetCountByDept[department.id] ?? 0,
  }));
}

export async function getActivityLog() {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { actor: true },
  });
}
