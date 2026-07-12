import { prisma } from "../../lib/prisma";
import {
  CreateMaintenanceInput,
  UpdateStatusInput,
  MaintenanceQuery,
} from "./maintenance.schema";
import { Prisma, MaintenanceStatus } from "@prisma/client";

const INCLUDE = {
  asset: { include: { category: true } },
  raisedBy: {
    select: { id: true, name: true, email: true, role: true },
  },
} as const;

// Valid status transitions
const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["TECHNICIAN_ASSIGNED"],
  REJECTED: [],
  TECHNICIAN_ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

export async function createRequest(
  input: CreateMaintenanceInput,
  userId: string
) {
  const asset = await prisma.asset.findUnique({
    where: { id: input.assetId },
  });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  const [request] = await prisma.$transaction([
    prisma.maintenanceRequest.create({
      data: {
        assetId: input.assetId,
        raisedById: userId,
        issueDescription: input.issueDescription,
        priority: input.priority as any,
        photoUrl: input.photoUrl || undefined,
      },
      include: INCLUDE,
    }),
    prisma.asset.update({
      where: { id: input.assetId },
      data: { status: "UNDER_MAINTENANCE" },
    }),
  ]);

  return request;
}

export async function updateStatus(
  id: string,
  input: UpdateStatusInput,
  approverId: string
) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!request) {
    const err: any = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const allowed = VALID_TRANSITIONS[request.status];
  if (!allowed.includes(input.status as MaintenanceStatus)) {
    const err: any = new Error(
      `Cannot transition from ${request.status} to ${input.status}`
    );
    err.status = 400;
    throw err;
  }

  const updateData: Prisma.MaintenanceRequestUpdateInput = {
    status: input.status as MaintenanceStatus,
    approvedById: approverId,
  };

  if (input.status === "TECHNICIAN_ASSIGNED" && input.technicianName) {
    updateData.technicianName = input.technicianName;
  }

  if (input.status === "RESOLVED") {
    updateData.resolvedAt = new Date();
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
    include: INCLUDE,
  });

  // If resolved or rejected, set asset back to available
  if (input.status === "RESOLVED" || input.status === "REJECTED") {
    await prisma.asset.update({
      where: { id: request.assetId },
      data: { status: "AVAILABLE" },
    });
  }

  return updated;
}

export async function listRequests(query: MaintenanceQuery) {
  const { status, priority, assetId, raisedById, page, limit } = query;

  const where: Prisma.MaintenanceRequestWhereInput = {};

  if (status) where.status = status as any;
  if (priority) where.priority = priority as any;
  if (assetId) where.assetId = assetId;
  if (raisedById) where.raisedById = raisedById;

  const [data, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getKanbanView() {
  const statuses: MaintenanceStatus[] = [
    "PENDING",
    "APPROVED",
    "TECHNICIAN_ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
  ];

  const columns = await Promise.all(
    statuses.map(async (status) => {
      const items = await prisma.maintenanceRequest.findMany({
        where: { status },
        include: INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return { status, items };
    })
  );

  return columns;
}
