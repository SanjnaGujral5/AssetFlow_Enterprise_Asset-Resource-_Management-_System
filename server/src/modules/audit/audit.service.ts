import { prisma } from "../../lib/prisma";
import { CreateAuditCycleInput, VerifyItemInput } from "./audit.schema";

const ITEM_INCLUDE = {
  asset: { include: { category: true } },
  verifiedBy: {
    select: { id: true, name: true, email: true, role: true },
  },
} as const;

export async function createAuditCycle(
  input: CreateAuditCycleInput,
  userId: string
) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (endDate <= startDate) {
    const err: any = new Error("End date must be after start date");
    err.status = 400;
    throw err;
  }

  // Build asset filter based on scope
  const assetWhere: any = {
    status: { notIn: ["DISPOSED", "RETIRED"] },
  };

  if (input.scopeLocation) {
    assetWhere.location = {
      contains: input.scopeLocation,
      mode: "insensitive",
    };
  }

  // Get assets matching scope
  const assets = await prisma.asset.findMany({
    where: assetWhere,
    select: { id: true },
  });

  if (assets.length === 0) {
    const err: any = new Error("No assets match the given scope");
    err.status = 400;
    throw err;
  }

  // Create cycle with auto-populated audit items
  const cycle = await prisma.auditCycle.create({
    data: {
      scopeDepartmentId: input.scopeDepartmentId,
      scopeLocation: input.scopeLocation,
      startDate,
      endDate,
      createdById: userId,
      items: {
        create: assets.map((a) => ({
          assetId: a.id,
        })),
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: { select: { items: true } },
    },
  });

  return cycle;
}

export async function listAuditCycles() {
  const cycles = await prisma.auditCycle.findMany({
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add verification stats for each cycle
  const result = await Promise.all(
    cycles.map(async (cycle) => {
      const [verified, discrepancies] = await Promise.all([
        prisma.auditItem.count({
          where: { auditCycleId: cycle.id, result: "VERIFIED" },
        }),
        prisma.auditItem.count({
          where: {
            auditCycleId: cycle.id,
            result: { in: ["MISSING", "DAMAGED"] },
          },
        }),
      ]);

      return {
        ...cycle,
        verifiedCount: verified,
        discrepancyCount: discrepancies,
        pendingCount: cycle._count.items - verified - discrepancies,
      };
    })
  );

  return result;
}

export async function getAuditCycleDetail(id: string) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: {
        include: ITEM_INCLUDE,
        orderBy: { asset: { assetTag: "asc" } },
      },
    },
  });

  if (!cycle) {
    const err: any = new Error("Audit cycle not found");
    err.status = 404;
    throw err;
  }

  return cycle;
}

export async function verifyItem(
  itemId: string,
  input: VerifyItemInput,
  verifierId: string
) {
  const item = await prisma.auditItem.findUnique({ where: { id: itemId } });

  if (!item) {
    const err: any = new Error("Audit item not found");
    err.status = 404;
    throw err;
  }

  const updated = await prisma.auditItem.update({
    where: { id: itemId },
    data: {
      result: input.result as any,
      notes: input.notes,
      verifiedById: verifierId,
      verifiedAt: new Date(),
    },
    include: ITEM_INCLUDE,
  });

  return updated;
}

export async function closeAuditCycle(id: string) {
  const cycle = await prisma.auditCycle.findUnique({ where: { id } });

  if (!cycle) {
    const err: any = new Error("Audit cycle not found");
    err.status = 404;
    throw err;
  }

  if (cycle.status === "CLOSED") {
    const err: any = new Error("Audit cycle is already closed");
    err.status = 400;
    throw err;
  }

  return prisma.auditCycle.update({
    where: { id },
    data: { status: "CLOSED" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: { select: { items: true } },
    },
  });
}

export async function getDiscrepancies(cycleId: string) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
  });

  if (!cycle) {
    const err: any = new Error("Audit cycle not found");
    err.status = 404;
    throw err;
  }

  const items = await prisma.auditItem.findMany({
    where: {
      auditCycleId: cycleId,
      result: { in: ["MISSING", "DAMAGED"] },
    },
    include: ITEM_INCLUDE,
    orderBy: { verifiedAt: "desc" },
  });

  return items;
}
