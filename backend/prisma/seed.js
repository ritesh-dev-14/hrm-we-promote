          // require("dotenv").config();
          // const { PrismaClient } = require("@prisma/client");
          // const bcrypt = require("bcrypt");

          // const prisma = new PrismaClient();

          // async function main() {
          //   const password = await bcrypt.hash("123456", 10);

          //   // =========================
          //   // DEPARTMENTS
          //   // =========================

          //   const departments = {};

          //   const departmentNames = ["HR", "Social Media"];

          //   for (const name of departmentNames) {
          //     departments[name] = await prisma.department.upsert({
          //       where: { name },
          //       update: {},
          //       create: { name },
          //     });
          //   }

          //   // =========================
          //   // ADMIN
          //   // =========================

          //   await prisma.user.upsert({
          //     where: { email: "admin@test.com" },
          //     update: {
          //       password,
          //     },
          //     create: {
          //       employeeId: "ADMIN-001",
          //       name: "Admin",
          //       email: "admin@test.com",
          //       password,
          //       role: "ADMIN",
          //     },
          //   });

          //   // =========================
          //   // HR
          //   // =========================

          //   await prisma.user.upsert({
          //     where: { email: "hrwepromote@gmail.com" },
          //     update: {
          //       password,
          //       departmentId: departments["HR"].id,
          //     },
          //     create: {
          //       employeeId: "HR-001",
          //       name: "HR User",
          //       email: "hrwepromote@gmail.com",
          //       password,
          //       role: "HR",
          //       departmentId: departments["HR"].id,
          //     },
          //   });

          //   // =========================
          //   // COORDINATOR - SONALI
          //   // =========================

          //   await prisma.user.upsert({
          //     where: { email: "ea.wepromote001@gmail.com" },
          //     update: {
          //       password,
          //       departmentId: departments["Social Media"].id,
          //     },
          //     create: {
          //       employeeId: "COORD-001",
          //       name: "Mamta Bhardwaj",
          //       email: "ea.wepromote001@gmail.com",
          //       password,
          //       role: "COORDINATOR",
          //       departmentId: departments["Social Media"].id,
          //     },
          //   });

          //   // =========================
          //   // EA - EXECUTIVE ASSISTANT
          //   // =========================

          //   await prisma.user.upsert({
          //     where: { email: "ea.manager@company.com" },
          //     update: {
          //       password,
          //       departmentId: departments["Social Media"].id,
          //       position: "Executive Assistant",
          //     },
          //     create: {
          //       employeeId: "EA-001",
          //       name: "EA User",
          //       email: "ea.manager@company.com",
          //       password,
          //       role: "EA",
          //       position: "Executive Assistant",
          //       departmentId: departments["Social Media"].id,
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
              "SEO Department",
              "Performance Marketing Department",
              "Social Media Department",
              "Content & Creative Department",
              "Web Development Department",
              "Sales & Business Development Department",
              "HR Department",
              "Video Production Department",
            ];

            for (const name of departmentNames) {
              departments[name] = await prisma.department.upsert({
                where: { name },
                update: {},
                create: { name },
              });
            }

            const hrDepartment = departments["HR Department"];
            const socialMediaDepartment = departments["Social Media Department"];

            if (!hrDepartment || !socialMediaDepartment) {
              throw new Error("Required departments were not created successfully");
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
                departmentId: hrDepartment.id,
              },
              create: {
                employeeId: "HR-001",
                name: "HR User",
                email: "hrwepromote@gmail.com",
                password,
                role: "HR",
                departmentId: hrDepartment.id,
              },
            });

            // =========================
            // COORDINATOR
            // =========================

            await prisma.user.upsert({
              where: { email: "ea.wepromote001@gmail.com" },
              update: {
                password,
                departmentId: socialMediaDepartment.id,
              },
              create: {
                employeeId: "COORD-001",
                name: "Mamta Bhardwaj",
                email: "ea.wepromote001@gmail.com",
                password,
                role: "COORDINATOR",
                departmentId: socialMediaDepartment.id,
              },
            });

            // =========================
            // EA - EXECUTIVE ASSISTANT
            // =========================

            await prisma.user.upsert({
              where: { email: "ea.manager@company.com" },
              update: {
                password,
                departmentId: socialMediaDepartment.id,
                position: "Executive Assistant",
              },
              create: {
                employeeId: "EA-001",
                name: "EA User",
                email: "ea.manager@company.com",
                password,
                role: "EA",
                position: "Executive Assistant",
                departmentId: socialMediaDepartment.id,
              },
            });

            // =========================
            // EMPLOYEE
            // =========================

            await prisma.user.upsert({
              where: { email: "employee@test.com" },
              update: {
                password,
                departmentId: socialMediaDepartment.id,
              },
              create: {
                employeeId: "EMP-001",
                name: "Employee User",
                email: "employee@test.com",
                password,
                role: "EMPLOYEE",
                departmentId: socialMediaDepartment.id,
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