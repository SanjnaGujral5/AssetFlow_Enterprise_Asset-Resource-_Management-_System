import { prisma } from "../../lib/prisma";

export async function requestTransfer(input: { assetId: string; toUserId: string; requestedById: string }) {
  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  return prisma.transferRequest.create({
    data: {
      assetId: input.assetId,
      toUserId: input.toUserId,
      requestedById: input.requestedById,
      status: "REQUESTED",
    },
  });
}

export async function approveTransfer(transferId: string, approved: boolean) {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: transferId } });
  if (!transfer) {
    const err: any = new Error("Transfer request not found");
    err.status = 404;
    throw err;
  }

  if (!approved) {
    return prisma.transferRequest.update({
      where: { id: transferId },
      data: { status: "REJECTED" },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.transferRequest.update({
      where: { id: transferId },
      data: { status: "APPROVED" },
    });

    await tx.asset.update({
      where: { id: transfer.assetId },
      data: { status: "ALLOCATED" },
    });
  });

  return prisma.transferRequest.update({
    where: { id: transferId },
    data: { status: "COMPLETED" },
  });
}
