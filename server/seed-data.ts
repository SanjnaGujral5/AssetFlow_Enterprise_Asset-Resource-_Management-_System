import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy data...");

  // 1. Departments
  const deptEngineering = await prisma.department.create({ data: { name: "Engineering" } });
  const deptHR = await prisma.department.create({ data: { name: "Human Resources" } });
  const deptOps = await prisma.department.create({ data: { name: "Operations" } });

  // 2. Categories
  const catLaptop = await prisma.assetCategory.create({ data: { name: "Laptops" } });
  const catVehicle = await prisma.assetCategory.create({ data: { name: "Vehicles" } });
  const catProjector = await prisma.assetCategory.create({ data: { name: "Projectors" } });

  // 3. Users
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const emp1 = await prisma.user.create({
    data: { name: "Alice Smith", email: "alice@assetflow.com", passwordHash, role: "EMPLOYEE", departmentId: deptEngineering.id }
  });
  const emp2 = await prisma.user.create({
    data: { name: "Bob Johnson", email: "bob@assetflow.com", passwordHash, role: "EMPLOYEE", departmentId: deptHR.id }
  });
  const mgr1 = await prisma.user.create({
    data: { name: "Charlie Manager", email: "charlie@assetflow.com", passwordHash, role: "ASSET_MANAGER", departmentId: deptOps.id }
  });

  const admin = await prisma.user.findUnique({ where: { email: "admin@assetflow.com" } });
  const adminId = admin!.id;

  // 4. Assets
  const asset1 = await prisma.asset.create({
    data: {
      name: "MacBook Pro 16",
      assetTag: "LPT-1001",
      serialNumber: "C02G123456",
      categoryId: catLaptop.id,
      currentHolderDeptId: deptEngineering.id,
      status: "ALLOCATED",
      condition: "GOOD",
      acquisitionCost: 2500,
      location: "NY Office",
    }
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: "Dell XPS 15",
      assetTag: "LPT-1002",
      serialNumber: "DL889900",
      categoryId: catLaptop.id,
      currentHolderDeptId: deptHR.id,
      status: "AVAILABLE",
      condition: "FAIR",
      acquisitionCost: 1800,
      location: "NY Office",
    }
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: "Ford Transit Van",
      assetTag: "VEH-2001",
      serialNumber: "VIN9876543210",
      categoryId: catVehicle.id,
      currentHolderDeptId: deptOps.id,
      status: "UNDER_MAINTENANCE",
      condition: "POOR",
      acquisitionCost: 35000,
      location: "Warehouse A",
    }
  });

  const asset4 = await prisma.asset.create({
    data: {
      name: "Epson 4K Projector",
      assetTag: "PRJ-3001",
      serialNumber: "EP112233",
      categoryId: catProjector.id,
      isBookable: true,
      status: "AVAILABLE",
      condition: "EXCELLENT",
      acquisitionCost: 1200,
      location: "Conference Room B",
    }
  });

  // 5. Allocations
  await prisma.allocation.create({
    data: {
      assetId: asset1.id,
      holderUserId: emp1.id,
      expectedReturnDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
      status: "ACTIVE",
    }
  });

  // 6. Maintenance Requests (Kanban Population)
  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset3.id,
      raisedById: mgr1.id,
      issueDescription: "Engine making strange noises, check engine light is on.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      technicianName: "AutoRepair Co."
    }
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset2.id,
      raisedById: emp2.id,
      issueDescription: "Battery drains very quickly.",
      priority: "MEDIUM",
      status: "PENDING",
    }
  });

  // 7. Notifications
  await prisma.notification.create({
    data: {
      userId: adminId,
      type: "MAINTENANCE_ALERT",
      message: "High priority maintenance request raised for VEH-2001.",
    }
  });
  await prisma.notification.create({
    data: {
      userId: adminId,
      type: "ASSET_TRANSFER",
      message: "Bob requested transfer of LPT-1002.",
      isRead: true
    }
  });

  console.log("Dummy data seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
