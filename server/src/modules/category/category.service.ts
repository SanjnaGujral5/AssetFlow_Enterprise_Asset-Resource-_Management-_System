import { prisma } from "../../lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.assetCategory.findUnique({
    where: { name: input.name },
  });

  if (existing) {
    const err: any = new Error("A category with this name already exists");
    err.status = 409;
    throw err;
  }

  return prisma.assetCategory.create({
    data: {
      name: input.name,
      customFieldsSchema: input.customFieldsSchema,
    },
  });
}

export async function listCategories() {
  return prisma.assetCategory.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.assetCategory.findUnique({
    where: { id },
  });

  if (!category) {
    const err: any = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  return category;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id);

  if (input.name) {
    const existing = await prisma.assetCategory.findFirst({
      where: { name: input.name, NOT: { id } },
    });

    if (existing) {
      const err: any = new Error("A category with this name already exists");
      err.status = 409;
      throw err;
    }
  }

  return prisma.assetCategory.update({
    where: { id },
    data: input,
  });
}
