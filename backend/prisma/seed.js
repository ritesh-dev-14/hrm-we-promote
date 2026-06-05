// require("dotenv").config();

// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

// const prisma = new PrismaClient();

// async function main() {
//   const password = await bcrypt.hash("123456", 10);

//   // 🔹 ADMIN
//   await prisma.user.upsert({
//     where: { email: "admin@test.com" },
//     update: { password },
//     create: {
//       employeeId: "ADMIN-001",
//       name: "Admin",
//       email: "admin@test.com",
//       password,
//       role: "ADMIN",
//     },
//   });

//   // 🔹 HR
//   await prisma.user.upsert({
//     where: { email: "hrwepromote@gmail.com" },
//     update: { password },
//     create: {
//       employeeId: "HR-001",
//       name: "HR User",
//       email: "hrwepromote@gmail.com",
//       password,
//       role: "HR",
//     },
//   });

//   // 🔹 MANAGER
//   const manager = await prisma.user.upsert({
//     where: { email: "manager@test.com" },
//     update: { password },
//     create: {
//       employeeId: "MGR-001",
//       name: "Manager User",
//       email: "manager@test.com",
//       password,
//       role: "MANAGER",
//     },
//   });

//   // 🔹 COORDINATOR
//   await prisma.user.upsert({
//     where: { email: "jasdeepsingh8077@gmail.com" },
//     update: { password },
//     create: {
//       employeeId: "COORD-001",
//       name: "Coordinator User",
//       email: "jasdeepsingh8077@gmail.com",
//       password,
//       role: "COORDINATOR",
//     },
//   });

//   // 🔹 EMPLOYEE 1
//   await prisma.user.upsert({
//     where: { email: "employee1@test.com" },
//     update: { password, managerId: manager.id },
//     create: {
//       employeeId: "EMP-001",
//       name: "Employee 1",
//       email: "employee1@test.com",
//       password,
//       role: "EMPLOYEE",
//       managerId: manager.id,
//     },
//   });

//   // 🔹 EMPLOYEE 2
//   await prisma.user.upsert({
//     where: { email: "employee2@test.com" },
//     update: { password, managerId: manager.id },
//     create: {
//       employeeId: "EMP-002",
//       name: "Employee 2",
//       email: "employee2@test.com",
//       password,
//       role: "EMPLOYEE",
//       managerId: manager.id,
//     },
//   });

//   // 🔹 EMPLOYEE 3
//   await prisma.user.upsert({
//     where: { email: "employee3@test.com" },
//     update: { password, managerId: manager.id },
//     create: {
//       employeeId: "EMP-003",
//       name: "Employee 3",
//       email: "employee3@test.com",
//       password,
//       role: "EMPLOYEE",
//       managerId: manager.id,
//     },
//   });

//   console.log("🌱 Seed data inserted successfully");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // =========================
  // DEPARTMENTS
  // =========================

  const departments = {};

  const departmentNames = [
    "SEO",
    "Performance Marketing",
    "Social Media",
    "Content & Creative",
    "Web Development",
    "Sales & Business Development",
    "HR",
    "Video Production",
  ];

  for (const name of departmentNames) {
    departments[name] = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // =========================
  // ADMIN
  // =========================

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      password,
    },
    create: {
      employeeId: "ADMIN-001",
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
    },
  });

  // =========================
  // HR
  // =========================

  await prisma.user.upsert({
    where: { email: "hrwepromote@gmail.com" },
    update: {
      password,
      departmentId: departments["HR"].id,
    },
    create: {
      employeeId: "HR-001",
      name: "HR User",
      email: "hrwepromote@gmail.com",
      password,
      role: "HR",
      departmentId: departments["HR"].id,
    },
  });

  // =========================
  // PERFORMANCE MARKETING MANAGER
  // =========================

  await prisma.user.upsert({
    where: { email: "ads.wepromoteindia@gmail.com" },
    update: {
      password,
      departmentId: departments["Performance Marketing"].id,
      position: "Performance Marketing Manager",
    },
    create: {
      employeeId: "PM-MGR-001",
      name: "Pankaj",
      email: "ads.wepromoteindia@gmail.com",
      password,
      role: "MANAGER",
      position: "Performance Marketing Manager",
      departmentId: departments["Performance Marketing"].id,
    },
  });

  // =========================
  // SOCIAL MEDIA MANAGER - LOVPRIT
  // =========================

  await prisma.user.upsert({
    where: { email: "smmwepromote@gmail.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
      position: "Social Media Manager",
    },
    create: {
      employeeId: "SM-MGR-001",
      name: "Lovprit",
      email: "smmwepromote@gmail.com",
      password,
      role: "MANAGER",
      position: "Social Media Manager",
      departmentId: departments["Social Media"].id,
    },
  });

  // =========================
  // SOCIAL MEDIA MANAGER - ABHIJEET
  // =========================

  await prisma.user.upsert({
    where: { email: "smm02wepromote@gmail.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
      position: "Social Media Manager",
    },
    create: {
      employeeId: "SM-MGR-002",
      name: "Abhijeet",
      email: "smm02wepromote@gmail.com",
      password,
      role: "MANAGER",
      position: "Social Media Manager",
      departmentId: departments["Social Media"].id,
    },
  });

  // =========================
  // COORDINATOR - SONALI
  // =========================

  await prisma.user.upsert({
    where: { email: "ea.wepromote001@gmail.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
    },
    create: {
      employeeId: "COORD-001",
      name: "Sonali",
      email: "ea.wepromote001@gmail.com",
      password,
      role: "COORDINATOR",
      departmentId: departments["Social Media"].id,
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