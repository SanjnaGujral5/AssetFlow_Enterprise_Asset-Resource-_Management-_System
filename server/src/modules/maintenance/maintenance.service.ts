import { prisma } from "../../lib/prisma";
import { AssetStateService, type AssetState } from "../../lib/assetStateService";

export async function listMaintenanceTasks(query: { mine?: string; userId?: string }) {
  const where: any = {};

  if (query.mine === "true" && query.userId) {
    where.raisedById = query.userId;
  }

  return prisma.maintenanceRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { asset: true, raisedBy: true },
  });
}

export async function createMaintenanceTask(input: {
  assetId: string;
  issueDescription: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  photoUrl?: string;
  technicianName?: string;
  raisedById: string;
}) {
  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  if (!asset.isMaintainable) {
    const err: any = new Error("This asset is not maintainable");
    err.status = 400;
    throw err;
  }

  const created = await prisma.maintenanceRequest.create({
    data: {
      assetId: input.assetId,
      raisedById: input.raisedById,
      issueDescription: input.issueDescription,
      priority: input.priority ?? "MEDIUM",
      photoUrl: input.photoUrl || undefined,
      technicianName: input.technicianName,
      status: "PENDING",
    },
  });

  return created;
}

export async function updateMaintenanceTask(
  maintenanceId: string,
  input: {
    status: "PENDING" | "APPROVED" | "REJECTED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
    issueDescription?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    photoUrl?: string;
    technicianName?: string;
    approvedById?: string;
  }
) {
  const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id: maintenanceId } });
  if (!maintenance) {
    const err: any = new Error("Maintenance task not found");
    err.status = 404;
    throw err;
  }

  const asset = await prisma.asset.findUnique({ where: { id: maintenance.assetId } });
  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  const updates: any = {
    status: input.status,
    issueDescription: input.issueDescription,
    priority: input.priority,
    photoUrl: input.photoUrl || undefined,
    technicianName: input.technicianName,
    approvedById: input.approvedById,
  };

  if (input.status === "RESOLVED") {
    AssetStateService.validateTransition(asset.status as AssetState, "AVAILABLE");
    updates.resolvedAt = new Date();
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id: maintenanceId },
    data: updates,
  });

  if (input.status === "APPROVED" || input.status === "TECHNICIAN_ASSIGNED" || input.status === "IN_PROGRESS") {
    if (asset.status !== "UNDER_MAINTENANCE") {
      AssetStateService.validateTransition(asset.status as AssetState, "UNDER_MAINTENANCE");
      await prisma.asset.update({
        where: { id: asset.id },
        data: { status: "UNDER_MAINTENANCE" },
      });
    }
  }

  if (input.status === "RESOLVED") {
    await prisma.asset.update({
      where: { id: asset.id },
      data: { status: "AVAILABLE" },
    });
  }

  return updated;
}
