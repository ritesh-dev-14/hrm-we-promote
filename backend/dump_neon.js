require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    select: { name: true, departmentId: true }
  });
  console.log("Neon DB Managers:");
  console.table(managers);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
