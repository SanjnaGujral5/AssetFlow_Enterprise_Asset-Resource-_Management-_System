import { prisma } from "../../lib/prisma";
import { AssetStateService, type AssetState } from "../../lib/assetStateService";

export async function listAssets(query: { search?: string; status?: string; categoryId?: string; departmentId?: string }) {
  const where: any = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { assetTag: { contains: query.search, mode: "insensitive" } },
      { serialNumber: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.departmentId) {
    where.currentHolderDeptId = query.departmentId;
  }

  return prisma.asset.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssetById(assetId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { category: true, allocations: true },
  });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  return asset;
}

export async function createAsset(input: any) {
  const assetTag = await generateAssetTag();
  const status = input.status ?? "AVAILABLE";

  if (status !== "AVAILABLE") {
    AssetStateService.validateTransition("AVAILABLE", status as AssetState);
  }

  return prisma.asset.create({
    data: {
      assetTag,
      name: input.name,
      categoryId: input.categoryId,
      serialNumber: input.serialNumber,
      acquisitionDate: input.acquisitionDate ? new Date(input.acquisitionDate) : undefined,
      acquisitionCost: input.acquisitionCost,
      condition: input.condition,
      location: input.location,
      photoUrl: input.photoUrl || undefined,
      isBookable: input.isBookable ?? false,
      isMaintainable: input.isMaintainable ?? false,
      status,
    },
    include: { category: true },
  });
}

async function generateAssetTag() {
  const assets = await prisma.asset.findMany({
    where: { assetTag: { startsWith: "AF-" } },
    select: { assetTag: true },
  });

  const highest = assets.reduce((max, asset) => {
    const match = asset.assetTag.match(/^AF-(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `AF-${String(highest + 1).padStart(4, "0")}`;
}
