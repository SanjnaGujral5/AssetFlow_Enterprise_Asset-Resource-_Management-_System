import { prisma } from "../../lib/prisma";
import { AssetStateService } from "../../lib/assetStateService";

export async function allocateAsset(input: { assetId: string; holderUserId?: string; holderDeptId?: string; expectedReturnDate?: string }) {
  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  const activeAllocation = await prisma.allocation.findFirst({
    where: { assetId: input.assetId, status: "ACTIVE" },
  });

  if (activeAllocation) {
    const err: any = new Error("Asset is already allocated. A return must be processed first.");
    err.status = 409;
    throw err;
  }

  AssetStateService.validateTransition(asset.status as any, "ALLOCATED");

  const allocation = await prisma.$transaction(async (tx) => {
    const created = await tx.allocation.create({
      data: {
        assetId: input.assetId,
        holderUserId: input.holderUserId,
        holderDeptId: input.holderDeptId,
        expectedReturnDate: input.expectedReturnDate ? new Date(input.expectedReturnDate) : undefined,
        status: "ACTIVE",
      },
    });

    await tx.asset.update({
      where: { id: input.assetId },
      data: {
        status: "ALLOCATED",
        currentHolderUserId: input.holderUserId ?? null,
        currentHolderDeptId: input.holderDeptId ?? null,
      },
    });

    return created;
  });

  return allocation;
}

export async function returnAsset(allocationId: string, input: { returnConditionNotes?: string }) {
  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
  if (!allocation) {
    const err: any = new Error("Allocation not found");
    err.status = 404;
    throw err;
  }

  if (allocation.status === "RETURNED") {
    const err: any = new Error("Asset has already been returned");
    err.status = 409;
    throw err;
  }

  const asset = await prisma.asset.findUnique({ where: { id: allocation.assetId } });
  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  AssetStateService.validateTransition(asset.status as any, "AVAILABLE");

  return prisma.$transaction(async (tx) => {
    await tx.allocation.update({
      where: { id: allocationId },
      data: {
        status: "RETURNED",
        actualReturnDate: new Date(),
        returnConditionNotes: input.returnConditionNotes,
      },
    });

    await tx.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: "AVAILABLE",
        currentHolderUserId: null,
        currentHolderDeptId: null,
      },
    });
  });
}
