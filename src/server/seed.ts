import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { mobile: "9876543210", password: "Customer@123", fullName: "Priya Sharma", role: "CUSTOMER" as const, city: "Lucknow", state: "Uttar Pradesh" },
    { mobile: "9123456789", password: "Vendor@123", fullName: "Rajesh Kumar", role: "VENDOR" as const, city: "Delhi", state: "Delhi" },
    { mobile: "9988776655", password: "Agent@123", fullName: "Sunita Verma", role: "AGENT" as const, city: "Jaipur", state: "Rajasthan" },
    { mobile: "9000000001", password: "Admin@123#", fullName: "Super Administrator", role: "ADMIN" as const, city: "Lucknow", state: "Uttar Pradesh" },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { mobile: u.mobile } });
    if (existing) continue;

    const passwordHash = await hash(u.password, 10);
    await prisma.user.create({
      data: {
        mobile: u.mobile,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        city: u.city,
        state: u.state,
        isVerified: true,
        isActive: true,
      },
    });
    console.log(`Created user: ${u.mobile}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });