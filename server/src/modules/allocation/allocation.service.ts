import { prisma } from "../../lib/prisma";
import {
  CreateAllocationInput,
  ReturnAllocationInput,
  AllocationQuery,
} from "./allocation.schema";
import { Prisma } from "@prisma/client";

export async function allocateAsset(input: CreateAllocationInput) {
  // Verify asset exists and is available
  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  if (asset.status !== "AVAILABLE") {
    const err: any = new Error(
      `Asset is currently ${asset.status.toLowerCase()} and cannot be allocated`
    );
    err.status = 400;
    throw err;
  }

  // Create allocation and update asset status in a transaction
  const [allocation] = await prisma.$transaction([
    prisma.allocation.create({
      data: {
        assetId: input.assetId,
        holderUserId: input.holderUserId,
        holderDeptId: input.holderDeptId,
        expectedReturnDate: input.expectedReturnDate
          ? new Date(input.expectedReturnDate)
          : undefined,
      },
      include: {
        asset: { include: { category: true } },
        holderUser: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.asset.update({
      where: { id: input.assetId },
      data: {
        status: "ALLOCATED",
        currentHolderUserId: input.holderUserId,
        currentHolderDeptId: input.holderDeptId,
      },
    }),
  ]);

  return allocation;
}

export async function returnAsset(
  allocationId: string,
  input: ReturnAllocationInput
) {
  const allocation = await prisma.allocation.findUnique({
    where: { id: allocationId },
  });

  if (!allocation) {
    const err: any = new Error("Allocation not found");
    err.status = 404;
    throw err;
  }

  if (allocation.status !== "ACTIVE") {
    const err: any = new Error("This allocation is not active");
    err.status = 400;
    throw err;
  }

  const [updated] = await prisma.$transaction([
    prisma.allocation.update({
      where: { id: allocationId },
      data: {
        status: "RETURNED",
        actualReturnDate: new Date(),
        returnConditionNotes: input.returnConditionNotes,
      },
      include: {
        asset: { include: { category: true } },
        holderUser: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: "AVAILABLE",
        currentHolderUserId: null,
        currentHolderDeptId: null,
      },
    }),
  ]);

  return updated;
}

export async function listAllocations(query: AllocationQuery) {
  const { assetId, holderUserId, status, page, limit } = query;

  const where: Prisma.AllocationWhereInput = {};

  if (assetId) where.assetId = assetId;
  if (holderUserId) where.holderUserId = holderUserId;
  if (status) where.status = status as any;

  const [data, total] = await Promise.all([
    prisma.allocation.findMany({
      where,
      include: {
        asset: { include: { category: true } },
        holderUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { allocatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.allocation.count({ where }),
  ]);

  return { data, total, page, limit };
}
