require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersWithNullDept = await prisma.user.findMany({
    where: { departmentId: null },
    include: { userDepartments: { include: { department: true } } }
  });
  console.log(`Found ${usersWithNullDept.length} users with null departmentId`);

  for (const user of usersWithNullDept) {
    console.log(`User ${user.name} (${user.role}) has ${user.userDepartments.length} userDepartments records`);
    if (user.userDepartments.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { departmentId: user.userDepartments[0].department.id }
      });
      console.log(`✅ Updated user ${user.name} with department ${user.userDepartments[0].department.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
