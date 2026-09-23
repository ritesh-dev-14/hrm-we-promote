require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersToUpdate = await prisma.user.findMany({
    where: { departmentId: null },
    include: { userDepartments: { include: { department: true } } }
  });

  for (const user of usersToUpdate) {
    if (user.userDepartments.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { departmentId: user.userDepartments[0].department.id }
      });
      console.log(`Updated user ${user.name} with department ${user.userDepartments[0].department.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
