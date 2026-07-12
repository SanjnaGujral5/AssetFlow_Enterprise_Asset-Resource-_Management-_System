import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AssetFlow demo data...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // --- Departments (created first, without heads, so we can assign
  // head users to them once those users exist) ---
  const it = await prisma.department.upsert({
    where: { name: "Information Technology" },
    update: {},
    create: { name: "Information Technology" },
  });

  const hr = await prisma.department.upsert({
    where: { name: "Human Resources" },
    update: {},
    create: { name: "Human Resources" },
  });

  const facilities = await prisma.department.upsert({
    where: { name: "Facilities" },
    update: {},
    create: { name: "Facilities" },
  });

  // --- Asset Categories ---
  await prisma.assetCategory.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      customFieldsSchema: { warrantyPeriodMonths: "number" },
    },
  });

  await prisma.assetCategory.upsert({
    where: { name: "Furniture" },
    update: {},
    create: { name: "Furniture" },
  });

  await prisma.assetCategory.upsert({
    where: { name: "Vehicles" },
    update: {},
    create: {
      name: "Vehicles",
      customFieldsSchema: { registrationNumber: "string" },
    },
  });

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: {},
    create: {
      name: "Ava Admin",
      email: "admin@assetflow.com",
      passwordHash,
      role: "ADMIN",
      departmentId: it.id,
    },
  });

  const assetManager = await prisma.user.upsert({
    where: { email: "manager@assetflow.com" },
    update: {},
    create: {
      name: "Marcus Manager",
      email: "manager@assetflow.com",
      passwordHash,
      role: "ASSET_MANAGER",
      departmentId: it.id,
    },
  });

  const deptHead = await prisma.user.upsert({
    where: { email: "depthead@assetflow.com" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "depthead@assetflow.com",
      passwordHash,
      role: "DEPT_HEAD",
      departmentId: hr.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "employee1@assetflow.com" },
    update: {},
    create: {
      name: "Raj Kumar",
      email: "employee1@assetflow.com",
      passwordHash,
      role: "EMPLOYEE",
      departmentId: hr.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "employee2@assetflow.com" },
    update: {},
    create: {
      name: "Sara Singh",
      email: "employee2@assetflow.com",
      passwordHash,
      role: "EMPLOYEE",
      departmentId: facilities.id,
    },
  });

  // Assign department heads now that the users exist.
  await prisma.department.update({
    where: { id: hr.id },
    data: { headUserId: deptHead.id },
  });

  console.log("Seed complete. Demo accounts (all use password: Password123!):");
  console.log("  Admin:          admin@assetflow.com");
  console.log("  Asset Manager:  manager@assetflow.com");
  console.log("  Dept Head:      depthead@assetflow.com");
  console.log("  Employee 1:     employee1@assetflow.com");
  console.log("  Employee 2:     employee2@assetflow.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
