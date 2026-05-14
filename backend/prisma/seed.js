// // require("dotenv").config();

// // const { PrismaClient } = require("@prisma/client");
// // const bcrypt = require("bcrypt");

// // const prisma = new PrismaClient();




// // require("dotenv").config();

// // console.log("ENV CHECK:", process.env.DATABASE_URL);

// // const { PrismaClient } = require("@prisma/client");
// // // const prisma = new PrismaClient();
// // const prisma = new PrismaClient({
// //   datasourceUrl: process.env.DATABASE_URL
// // });



// // require("dotenv").config();

// // const { PrismaClient } = require("@prisma/client");
// // const bcrypt = require("bcrypt");

// // const prisma = new PrismaClient({
// //   datasourceUrl: process.env.DATABASE_URL
// // });













// require("dotenv").config();

// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

// const prisma = new PrismaClient(); // ✅ NO options
// async function main() {
//   const password = await bcrypt.hash("123456", 10);

//   // 🔹 ADMIN
//   const admin = await prisma.user.upsert({
//     where: { email: "admin@test.com" },
//     update: {},
//     create: {
//       employeeId: "ADMIN-001",
//       name: "Admin",
//       email: "admin@test.com",
//       password,
//       role: "ADMIN"
//     }
//   });

//   // 🔹 HR
//   const hr = await prisma.user.upsert({
//     where: { email: "hr@test.com" },
//     update: {},
//     create: {
//       employeeId: "HR-001",
//       name: "HR User",
//       email: "hr@test.com",
//       password,
//       role: "HR",
//       createdById: admin.id
//     }
//   });

//   // 🔹 MANAGER
//   const manager = await prisma.user.upsert({
//     where: { email: "manager@test.com" },
//     update: {},
//     create: {
//       employeeId: "MGR-001",
//       name: "Manager User",
//       email: "manager@test.com",
//       password,
//       role: "MANAGER",
//       department: "Production",
//       createdById: hr.id
//     }
//   });

//   // 🔹 EMPLOYEE
//   await prisma.user.upsert({
//     where: { email: "employee@test.com" },
//     update: {},
//     create: {
//       employeeId: "EMP-001",
//       name: "Employee User",
//       email: "employee@test.com",
//       password,
//       role: "EMPLOYEE",
//       createdById: manager.id
//     }
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

// ✅ Use datasourceUrl for runtime configuration
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // 🔹 ADMIN
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      employeeId: "ADMIN-001",
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN"
    }
  });

  // 🔹 HR
  const hr = await prisma.user.upsert({
    where: { email: "hr@test.com" },
    update: {},
    create: {
      employeeId: "HR-001",
      name: "HR User",
      email: "hr@test.com",
      password,
      role: "HR",
      createdById: admin.id
    }
  });

  // 🔹 MANAGER
  const manager = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: {},
    create: {
      employeeId: "MGR-001",
      name: "Manager User",
      email: "manager@test.com",
      password,
      role: "MANAGER",
      // department: "Production",
      createdById: hr.id
    }
  });

  // 🔹 EMPLOYEE
  await prisma.user.upsert({
    where: { email: "employee@test.com" },
    update: {},
    create: {
      employeeId: "EMP-001",
      name: "Employee User",
      email: "employee@test.com",
      password,
      role: "EMPLOYEE",
      createdById: manager.id
    }
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