import { prisma } from "../../lib/prisma";

export async function getDashboardMetrics() {
  const [
    totalAssets,
    totalValueResult,
    activeAllocations,
    openMaintenance,
    statusGroup,
    categoryGroup,
  ] = await Promise.all([
    // Total Assets (excluding disposed/retired)
    prisma.asset.count({
      where: { status: { notIn: ["DISPOSED", "RETIRED"] } },
    }),
    // Total Asset Value
    prisma.asset.aggregate({
      where: { status: { notIn: ["DISPOSED", "RETIRED"] } },
      _sum: { acquisitionCost: true },
    }),
    // Active Allocations
    prisma.allocation.count({
      where: { status: "ACTIVE" },
    }),
    // Open Maintenance Requests
    prisma.maintenanceRequest.count({
      where: { status: { notIn: ["RESOLVED", "REJECTED"] } },
    }),
    // Breakdown by Status
    prisma.asset.groupBy({
      by: ["status"],
      _count: true,
      where: { status: { notIn: ["DISPOSED", "RETIRED"] } },
    }),
    // Breakdown by Category
    prisma.asset.groupBy({
      by: ["categoryId"],
      _count: true,
      where: { status: { notIn: ["DISPOSED", "RETIRED"] } },
    }),
  ]);

  // Fetch category names for the category breakdown
  const categoryIds = categoryGroup.map((c: any) => c.categoryId);
  const categories = await prisma.assetCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

  const formattedCategoryBreakdown = categoryGroup.map((c: any) => ({
    categoryId: c.categoryId,
    categoryName: categoryMap.get(c.categoryId) || "Unknown",
    count: c._count,
  }));

  const formattedStatusBreakdown = statusGroup.map((s: any) => ({
    status: s.status,
    count: s._count,
  }));

  return {
    summary: {
      totalAssets,
      totalValue: totalValueResult._sum.acquisitionCost || 0,
      activeAllocations,
      openMaintenance,
    },
    statusBreakdown: formattedStatusBreakdown,
    categoryBreakdown: formattedCategoryBreakdown,
  };
}
