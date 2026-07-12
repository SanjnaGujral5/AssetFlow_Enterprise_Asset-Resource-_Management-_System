import { prisma } from "../../lib/prisma";
import { CreateTransferInput, TransferQuery } from "./transfer.schema";
import { Prisma } from "@prisma/client";

const USER_SELECT = { id: true, name: true, email: true, role: true } as const;

export async function createTransfer(
  input: CreateTransferInput,
  requesterId: string
) {
  // Verify asset exists
  const asset = await prisma.asset.findUnique({
    where: { id: input.assetId },
  });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  if (asset.status !== "ALLOCATED") {
    const err: any = new Error(
      "Only allocated assets can be transferred"
    );
    err.status = 400;
    throw err;
  }

  const transfer = await prisma.transferRequest.create({
    data: {
      assetId: input.assetId,
      fromUserId: asset.currentHolderUserId,
      toUserId: input.toUserId,
      requestedById: requesterId,
    },
    include: {
      asset: { include: { category: true } },
      fromUser: { select: USER_SELECT },
      toUser: { select: USER_SELECT },
      requestedBy: { select: USER_SELECT },
    },
  });

  return transfer;
}

export async function approveTransfer(id: string, approverId: string) {
  const transfer = await prisma.transferRequest.findUnique({
    where: { id },
  });

  if (!transfer) {
    const err: any = new Error("Transfer request not found");
    err.status = 404;
    throw err;
  }

  if (transfer.status !== "REQUESTED") {
    const err: any = new Error("This transfer has already been processed");
    err.status = 400;
    throw err;
  }

  // Approve and update asset holder in a transaction
  const [updated] = await prisma.$transaction([
    prisma.transferRequest.update({
      where: { id },
      data: { status: "APPROVED", approvedById: approverId },
      include: {
        asset: { include: { category: true } },
        fromUser: { select: USER_SELECT },
        toUser: { select: USER_SELECT },
        requestedBy: { select: USER_SELECT },
      },
    }),
    // Update asset's current holder
    prisma.asset.update({
      where: { id: transfer.assetId },
      data: { currentHolderUserId: transfer.toUserId },
    }),
    // Close old allocation and create new one
    ...(transfer.fromUserId
      ? [
          prisma.allocation.updateMany({
            where: {
              assetId: transfer.assetId,
              holderUserId: transfer.fromUserId,
              status: "ACTIVE",
            },
            data: {
              status: "RETURNED",
              actualReturnDate: new Date(),
              returnConditionNotes: "Transferred to another user",
            },
          }),
        ]
      : []),
    prisma.allocation.create({
      data: {
        assetId: transfer.assetId,
        holderUserId: transfer.toUserId,
      },
    }),
  ]);

  return updated;
}

export async function rejectTransfer(id: string, approverId: string) {
  const transfer = await prisma.transferRequest.findUnique({
    where: { id },
  });

  if (!transfer) {
    const err: any = new Error("Transfer request not found");
    err.status = 404;
    throw err;
  }

  if (transfer.status !== "REQUESTED") {
    const err: any = new Error("This transfer has already been processed");
    err.status = 400;
    throw err;
  }

  const updated = await prisma.transferRequest.update({
    where: { id },
    data: { status: "REJECTED", approvedById: approverId },
    include: {
      asset: { include: { category: true } },
      fromUser: { select: USER_SELECT },
      toUser: { select: USER_SELECT },
      requestedBy: { select: USER_SELECT },
    },
  });

  return updated;
}

export async function listTransfers(query: TransferQuery) {
  const { assetId, status, requestedById, page, limit } = query;

  const where: Prisma.TransferRequestWhereInput = {};

  if (assetId) where.assetId = assetId;
  if (status) where.status = status as any;
  if (requestedById) where.requestedById = requestedById;

  const [data, total] = await Promise.all([
    prisma.transferRequest.findMany({
      where,
      include: {
        asset: { include: { category: true } },
        fromUser: { select: USER_SELECT },
        toUser: { select: USER_SELECT },
        requestedBy: { select: USER_SELECT },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transferRequest.count({ where }),
  ]);

  return { data, total, page, limit };
}
