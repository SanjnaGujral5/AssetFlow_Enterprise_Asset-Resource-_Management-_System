import { prisma } from "../../lib/prisma";
import { CreateAssetInput, UpdateAssetInput, AssetQuery } from "./asset.schema";
import { Prisma } from "@prisma/client";

export async function createAsset(input: CreateAssetInput) {
  // Check for duplicate asset tag
  const existing = await prisma.asset.findUnique({
    where: { assetTag: input.assetTag },
  });

  if (existing) {
    const err: any = new Error("An asset with this tag already exists");
    err.status = 409;
    throw err;
  }

  const asset = await prisma.asset.create({
    data: {
      name: input.name,
      assetTag: input.assetTag,
      categoryId: input.categoryId,
      serialNumber: input.serialNumber,
      acquisitionDate: input.acquisitionDate
        ? new Date(input.acquisitionDate)
        : undefined,
      acquisitionCost: input.acquisitionCost,
      condition: input.condition,
      location: input.location,
      photoUrl: input.photoUrl || undefined,
      isBookable: input.isBookable ?? false,
    },
    include: { category: true },
  });

  return asset;
}

export async function listAssets(query: AssetQuery) {
  const { search, status, categoryId, page, limit } = query;

  const where: Prisma.AssetWhereInput = {};

  // Search across name, assetTag, serialNumber
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { assetTag: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by status
  if (status) {
    where.status = status as any;
  }

  // Filter by category
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  return asset;
}

export async function updateAsset(id: string, input: UpdateAssetInput) {
  // Ensure asset exists
  await getAssetById(id);

  // If assetTag is being changed, check for duplicates
  if (input.assetTag) {
    const existing = await prisma.asset.findFirst({
      where: { assetTag: input.assetTag, NOT: { id } },
    });

    if (existing) {
      const err: any = new Error("An asset with this tag already exists");
      err.status = 409;
      throw err;
    }
  }

  const asset = await prisma.asset.update({
    where: { id },
    data: {
      ...input,
      acquisitionDate: input.acquisitionDate
        ? new Date(input.acquisitionDate)
        : undefined,
      photoUrl: input.photoUrl || undefined,
    },
    include: { category: true },
  });

  return asset;
}

export async function deleteAsset(id: string) {
  // Soft delete — set status to DISPOSED rather than removing from DB
  await getAssetById(id);

  const asset = await prisma.asset.update({
    where: { id },
    data: { status: "DISPOSED" },
    include: { category: true },
  });

  return asset;
}

export async function createBulkAssets(inputs: CreateAssetInput[]) {
  // Validate all categories exist to avoid foreign key errors breaking the whole batch
  const categoryIds = [...new Set(inputs.map((i) => i.categoryId))];
  const categories = await prisma.assetCategory.findMany({
    where: { id: { in: categoryIds } },
  });

  if (categories.length !== categoryIds.length) {
    const err: any = new Error("One or more category IDs are invalid");
    err.status = 400;
    throw err;
  }

  // Prisma createMany is atomic by default
  const result = await prisma.asset.createMany({
    data: inputs.map((input) => ({
      name: input.name,
      categoryId: input.categoryId,
      assetTag: input.assetTag,
      serialNumber: input.serialNumber || null,
      acquisitionDate: input.acquisitionDate ? new Date(input.acquisitionDate) : null,
      acquisitionCost: input.acquisitionCost || null,
      condition: input.condition || null,
      location: input.location || null,
      photoUrl: input.photoUrl || null,
      isBookable: input.isBookable || false,
    })),
    skipDuplicates: true, // skip duplicate tags gracefully
  });

  return { count: result.count };
}
