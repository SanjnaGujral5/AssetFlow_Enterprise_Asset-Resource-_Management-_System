import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: {},
    create: {
      email: "admin@assetflow.com",
      name: "System Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin seeded:", admin.email, "Password: password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
