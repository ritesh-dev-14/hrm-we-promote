const prisma = require("./src/config/prisma");

Promise.all([
  prisma.$queryRawUnsafe('SELECT id, "clientName", month, year FROM "MarketingPlan"'),
  prisma.$queryRawUnsafe('SELECT p.id, p."projectName", p."clientName", d.name AS "departmentName" FROM "Project" p JOIN "Department" d ON d.id = p."departmentId" WHERE LOWER(d.name) LIKE \'%marketing%\''),
])
  .then((rows) => console.log(JSON.stringify(rows, null, 2)))
  .catch((error) => console.error(error.message))
  .finally(() => prisma.$disconnect());
