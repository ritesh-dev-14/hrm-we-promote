require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // 🔹 ADMIN
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: { password },
    create: {
      employeeId: "ADMIN-001",
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
    },
  });

  // 🔹 HR
  await prisma.user.upsert({
    where: { email: "hr@test.com" },
    update: { password },
    create: {
      employeeId: "HR-001",
      name: "HR User",
      email: "hr@test.com",
      password,
      role: "HR",
    },
  });

  // 🔹 MANAGER
  const manager = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: { password },
    create: {
      employeeId: "MGR-001",
      name: "Manager User",
      email: "manager@test.com",
      password,
      role: "MANAGER",
    },
  });

  // 🔹 EMPLOYEE 1
  await prisma.user.upsert({
    where: { email: "employee1@test.com" },
    update: { password, managerId: manager.id },
    create: {
      employeeId: "EMP-001",
      name: "Employee 1",
      email: "employee1@test.com",
      password,
      role: "EMPLOYEE",
      managerId: manager.id,
    },
  });

  // 🔹 EMPLOYEE 2
  await prisma.user.upsert({
    where: { email: "employee2@test.com" },
    update: { password, managerId: manager.id },
    create: {
      employeeId: "EMP-002",
      name: "Employee 2",
      email: "employee2@test.com",
      password,
      role: "EMPLOYEE",
      managerId: manager.id,
    },
  });

  // 🔹 EMPLOYEE 3
  await prisma.user.upsert({
    where: { email: "employee3@test.com" },
    update: { password, managerId: manager.id },
    create: {
      employeeId: "EMP-003",
      name: "Employee 3",
      email: "employee3@test.com",
      password,
      role: "EMPLOYEE",
      managerId: manager.id,
    },
  });

  console.log("🌱 Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });